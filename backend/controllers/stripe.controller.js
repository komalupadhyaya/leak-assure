const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const emailService = require('../services/email.service');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Affiliate = require('../models/Affiliate');
const Payment = require('../models/Payment');

exports.handleWebhook = async (req, res) => {

    console.log("\n================ STRIPE WEBHOOK RECEIVED ================");
    console.log("Time:", new Date().toISOString());

    const sig = req.headers['stripe-signature'];

    console.log("Signature Header:", sig ? "PRESENT" : "MISSING");
    console.log("Webhook Secret Exists:", process.env.STRIPE_WEBHOOK_SECRET ? "YES" : "NO");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("Webhook verification SUCCESS. Event Type:", event.type);
    } catch (err) {
        console.error("Webhook signature verification FAILED:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log("\n--- PROCESSING CHECKOUT SESSION ---");
        console.log("Session ID:", session.id);
        console.log("Customer ID:", session.customer);
        console.log("Subscription ID:", session.subscription);
        console.log("Metadata Email:", session.metadata?.email);

        try {
            // Enhanced lookup: try Session ID first, then Customer ID, then Email
            const user = await User.findOne({
                $or: [
                    { stripeSessionId: session.id },
                    { stripeCustomerId: session.customer },
                    { email: session.metadata?.email }
                ]
            });

            console.log("User Lookup Result:", user ? `FOUND (${user.email}, ID: ${user._id})` : "NOT FOUND");

            if (!user) {
                console.warn("CRITICAL: No user matched this Stripe session. Database might be out of sync.");
                return res.json({ received: true });
            }

            let sendCredentials = false;
            let tempPassword = '';

            if (user.subscriptionStatus !== 'active') {
                console.log("[Webhook] Updating user status to active...");
                
                let planPrice = 0;
                if (session.amount_total) {
                    planPrice = session.amount_total / 100;
                } else {
                    planPrice = user.plan === 'premium' ? 49 : 29;
                }

                user.stripeSubscriptionId = session.subscription;
                user.subscriptionStatus = 'active';
                user.activatedAt = new Date();
                user.lastPaymentDate = new Date();
                user.planPrice = planPrice;

                if (!user.password) {
                    console.log(`[Stripe Webhook] Generating temporary credentials for new user: ${user.email}`);
                    tempPassword = crypto.randomBytes(4).toString('hex');
                    const hashedPassword = await bcrypt.hash(tempPassword, 10);
                    user.password = hashedPassword;
                    user.forcePasswordChange = true;
                    sendCredentials = true;
                }

                await user.save();
                console.log("[Webhook] User record updated successfully. Current status:", user.subscriptionStatus);

                // RECORD INITIAL PAYMENT
                try {
                    await Payment.create({
                        memberId: user._id,
                        stripePaymentIntentId: session.payment_intent,
                        stripeInvoiceId: session.invoice,
                        amount: session.amount_total / 100,
                        status: 'succeeded',
                        planType: user.plan,
                        billingReason: 'subscription_create'
                    });
                    console.log("[Webhook] Initial payment recorded in DB.");
                } catch (payErr) {
                    console.error("[Webhook Payment Recording Error]:", payErr.message);
                }
            } else {
                console.log("[Webhook] User already active. Processing remaining triggers (email, referrals)...");
            }

            // --- AFFILIATE CONVERSION & COMMISSION ---
            try {
                const referral = await Referral.findOne({ referredUserId: user._id, convertedAt: null });
                if (referral) {
                    console.log("[Webhook] Found referral to convert.");
                    referral.convertedAt = new Date();
                    await referral.save();

                    const affiliate = await Affiliate.findById(referral.affiliateId);
                    let commissionAmount = 0;

                    if (affiliate) {
                        const paidAmount = session.amount_total / 100;
                        if (affiliate.commissionType === 'fixed') {
                            commissionAmount = affiliate.commissionValue;
                        } else {
                            commissionAmount = (paidAmount * affiliate.commissionValue) / 100;
                        }
                    } else {
                        // Fallback to env if affiliate not found for some reason
                        commissionAmount = parseInt(process.env.AFFILIATE_COMMISSION_AMOUNT || '20', 10);
                    }

                    const commission = new Commission({
                        affiliateId: referral.affiliateId,
                        referralId: referral._id,
                        amount: commissionAmount,
                        status: 'pending',
                    });
                    await commission.save();
                    console.log(`[Webhook] Referral record updated and commission created: $${commissionAmount}`);
                }
            } catch (refErr) {
                console.error('[Webhook Referral Error]:', refErr.message);
            }

            // --- SEND ENROLLMENT CONFIRMATION EMAIL & SMS ---
            console.log("[Webhook] Checking confirmationEmailSent flag:", user.confirmationEmailSent);
            if (!user.confirmationEmailSent) {
                console.log("[Webhook] Triggering enrollment notification to:", user.email);
                try {
                    // Send Email
                    const emailResult = await emailService.sendEnrollmentConfirmationEmail(user);
                    
                    // Send SMS if phone exists
                    if (user.phone) {
                        const smsService = require('../services/sms.service');
                        await smsService.sendEnrollmentConfirmationSMS(user.phone, user.fullName);
                    }

                    if (emailResult) {
                        user.confirmationEmailSent = true;
                        // Use findOneAndUpdate to avoid version conflicts if another save is happening
                        await User.findByIdAndUpdate(user._id, { confirmationEmailSent: true });
                    }
                } catch (notifyError) {
                    console.error("[Webhook Notification Exception]:", notifyError.message);
                }
            } else {
                console.log("[Webhook] confirmationEmailSent is already true. Skipping.");
            }

            // --- SEND CREDENTIALS IF NEEDED ---
            if (sendCredentials) {
                console.log("[Webhook] Sending login credentials email...");
                try {
                    await emailService.sendLoginCredentials(user.email, user.fullName, tempPassword);
                } catch (credError) {
                    console.error("[Webhook Credentials Email Error]:", credError.message);
                }
            }

        } catch (error) {
            console.error("FATAL ERROR during checkout.session.completed processing:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }

    } else if (event.type === 'invoice.payment_failed') {

        const invoice = event.data.object;

        console.log("\n--- PAYMENT FAILED EVENT ---");
        console.log("Invoice ID:", invoice.id);
        console.log("Customer ID:", invoice.customer);

        try {
            const user = await User.findOne({ stripeCustomerId: invoice.customer });
            if (user) {
                const gracePeriod = new Date();
                gracePeriod.setDate(gracePeriod.getDate() + 7);

                user.subscriptionStatus = 'past_due';
                user.paymentGraceUntil = gracePeriod;
                await user.save();

                console.log("User marked past_due with grace period:", user.email);
                
                // RECORD FAILED PAYMENT
                await Payment.create({
                    memberId: user._id,
                    stripeInvoiceId: invoice.id,
                    amount: invoice.amount_due / 100,
                    status: 'failed',
                    planType: user.plan,
                    billingReason: invoice.billing_reason
                });

                // NOTIFY USER ABOUT FAILED PAYMENT
                await emailService.sendPaymentFailedNotice(user.email, user.fullName);
            } else {
                console.warn("No user found for failed invoice customer:", invoice.customer);
            }
        } catch (error) {
            console.error("Error handling invoice.payment_failed");
            console.error(error);
        }

    } else if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        
        // Skip initial payment if it was already handled by checkout.session.completed
        // (Checkout session usually handles the first payment of a subscription)
        if (invoice.billing_reason === 'subscription_create') {
            console.log("[Webhook] Skipping recurring commission for initial subscription invoice.");
            return res.json({ received: true });
        }

        console.log("\n--- RECURRING PAYMENT SUCCEEDED ---");
        console.log("Invoice ID:", invoice.id);
        console.log("Customer ID:", invoice.customer);

        try {
            const user = await User.findOne({ stripeCustomerId: invoice.customer });
            if (!user) {
                console.warn("[Webhook] User not found for recurring payment:", invoice.customer);
                return res.json({ received: true });
            }

            const referral = await Referral.findOne({ referredUserId: user._id });
            if (referral) {
                const affiliate = await Affiliate.findById(referral.affiliateId);
                let commissionAmount = 0;

                if (affiliate) {
                    const paidAmount = invoice.amount_paid / 100;
                    if (affiliate.commissionType === 'fixed') {
                        commissionAmount = affiliate.commissionValue;
                    } else {
                        commissionAmount = (paidAmount * affiliate.commissionValue) / 100;
                    }

                    const commission = new Commission({
                        affiliateId: affiliate._id,
                        referralId: referral._id,
                        amount: commissionAmount,
                        status: 'pending',
                        metadata: { invoiceId: invoice.id }
                    });
                    await commission.save();
                    console.log(`[Webhook] Recurring commission created: $${commissionAmount} for affiliate: ${affiliate.email}`);
                }
            }

            // RECORD SUCCESSFUL RECURRING PAYMENT
            await Payment.create({
                memberId: user._id,
                stripeInvoiceId: invoice.id,
                stripePaymentIntentId: invoice.payment_intent,
                amount: invoice.amount_paid / 100,
                status: 'succeeded',
                planType: user.plan,
                billingReason: invoice.billing_reason
            });
            console.log("[Webhook] Recurring payment recorded in DB.");
        } catch (error) {
            console.error("[Webhook] Error processing recurring commission:", error.message);
        }

    } else if (event.type === 'customer.subscription.deleted') {

        const subscription = event.data.object;

        console.log("\n--- SUBSCRIPTION CANCELED ---");
        console.log("Subscription ID:", subscription.id);

        try {
            const user = await User.findOne({ stripeSubscriptionId: subscription.id });
            if (user) {
                user.subscriptionStatus = 'canceled';
                await user.save();
                console.log("User subscription canceled:", user.email);
                
                // NOTIFY USER ABOUT CANCELLATION
                await emailService.sendCancellationNotice(user.email, user.fullName);
            } else {
                console.warn("No user found for canceled subscription:", subscription.id);
            }
        } catch (error) {
            console.error("Error processing subscription.deleted event");
            console.error(error);
        }
    }

    console.log("Webhook processing finished.");
    console.log("=========================================================\n");

    res.json({ received: true });


};

exports.getSessionDetails = async (req, res) => {

    const { sessionId } = req.params;

    console.log("Fetching session details:", sessionId);

    try {

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const user = await User.findOne({ stripeCustomerId: session.customer });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'member' }, process.env.JWT_SECRET || 'your_fallback_secret_key', { expiresIn: '7d' });

        // Set cookie for cross-subdomain auto-login
        res.cookie('token', token, {
            httpOnly: false, // Set to false so frontend can read it for cross-subdomain auto-login
            secure: true,
            sameSite: 'none',
            domain: process.env.COOKIE_DOMAIN || '.leakassure.com',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // --- FALLBACK TRIGGER: Activate account if webhook missed it ---
        if (user.subscriptionStatus === 'pending') {
            console.log(`[Fallback] Activating account for: ${user.email}`);
            user.subscriptionStatus = 'active';
            user.activatedAt = new Date();
            user.stripeSubscriptionId = session.subscription;
            user.planPrice = session.amount_total ? session.amount_total / 100 : (user.plan === 'premium' ? 49 : 29);
            await user.save();
        }

        // --- FALLBACK TRIGGER: Send enrollment email if webhook missed it ---
        if (!user.confirmationEmailSent) {
            console.log(`[Fallback] Triggering enrollment confirmation for: ${user.email}`);
            try {
                const emailResult = await emailService.sendEnrollmentConfirmationEmail(user);
                if (emailResult) {
                    user.confirmationEmailSent = true;
                    await user.save();
                    console.log("[Fallback] Confirmation email sent successfully.");
                }
            } catch (notifyError) {
                console.error("[Fallback Notification Error]:", notifyError.message);
            }
        }

        res.json({
            name: user.fullName,
            serviceAddress: user.serviceAddress,
            plan: user.plan,
            price: user.planPrice || (user.plan === 'premium' ? 49 : 29),
            waitingPeriodEnd: user.waitingPeriodEnd,
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role || 'member',
                forcePasswordChange: user.forcePasswordChange
            }
        });

    } catch (error) {

        console.error("Error fetching session details:", error);

        res.status(500).json({ error: 'Internal server error' });
    }

};

exports.createBillingPortal = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Stripe customer not found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}/member/settings`,
        });

        console.log("Billing portal session created for:", user.email);

        res.json({ url: session.url });

    } catch (error) {

        console.error("Error creating billing portal session:", error);

        res.status(500).json({ error: 'Failed to create billing portal' });
    }

};
