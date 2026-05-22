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

// Helper function to safely find or create user upon successful payment
const getOrCreateUserFromSession = async (session) => {
    // 1. Try to find the user in DB
    let user = await User.findOne({
        $or: [
            { stripeSessionId: session.id },
            { stripeCustomerId: session.customer },
            { email: session.metadata?.email }
        ]
    });

    if (user) {
        return { user, isNew: false };
    }

    // 2. Verify metadata contains the required fields
    const meta = session.metadata;
    if (!meta || !meta.email || !meta.passwordHash) {
        console.warn("[getOrCreateUserFromSession] Metadata is missing email/password for session:", session.id);
        return { user: null, isNew: false };
    }

    console.log("[getOrCreateUserFromSession] Creating user from session metadata:", meta.email);

    // 3. Resolve planPrice
    let planPrice = 0;
    if (session.amount_total) {
        planPrice = session.amount_total / 100;
    } else {
        planPrice = meta.plan === 'premium' ? 49 : 29;
    }

    // 4. Create User record with active status
    const createdAt = new Date();
    const waitingPeriodEnd = new Date(createdAt);
    waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + 30);

    user = new User({
        firstName: meta.firstName || '',
        lastName: meta.lastName || '',
        fullName: meta.fullName || '',
        email: meta.email,
        phone: meta.phone || '',
        serviceAddress: meta.serviceAddress || '',
        addressStreet: meta.addressStreet || '',
        addressCity: meta.addressCity || '',
        addressState: meta.addressState || '',
        addressZip: meta.addressZip || '',
        addressCountry: meta.addressCountry || 'US',
        plan: meta.plan || 'essential',
        smsOptIn: meta.smsOptIn === 'true',
        password: meta.passwordHash,
        role: 'member',
        forcePasswordChange: false,
        stripeCustomerId: session.customer,
        stripeSessionId: session.id,
        stripeSubscriptionId: session.subscription,
        subscriptionStatus: 'active',
        planPrice,
        activatedAt: new Date(),
        lastPaymentDate: new Date(),
        waitingPeriodEnd,
        createdAt
    });

    await user.save();
    console.log("[getOrCreateUserFromSession] Successfully created and saved User:", user._id);

    // 5. Handle Referral and Affiliate logic if refCode exists
    if (meta.refCode) {
        try {
            const affiliate = await Affiliate.findOne({ referralCode: meta.refCode, status: 'approved' });
            if (affiliate) {
                const referral = new Referral({
                    affiliateId: affiliate._id,
                    referredUserId: user._id,
                    referredEmail: user.email,
                    convertedAt: new Date(),
                });
                await referral.save();
                console.log(`[getOrCreateUserFromSession Referral] Created and converted referral for affiliate: ${affiliate.email}`);

                // Generate commission
                let commissionAmount = 0;
                const paidAmount = planPrice;
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
                });
                await commission.save();
                console.log(`[getOrCreateUserFromSession Commission] Created pending commission: $${commissionAmount}`);
            }
        } catch (refErr) {
            console.error('[getOrCreateUserFromSession Referral Error]:', refErr.message);
        }
    }

    return { user, isNew: true };
};

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
            // Find or create User from Stripe Session
            const { user, isNew } = await getOrCreateUserFromSession(session);

            if (!user) {
                console.warn("CRITICAL: Failed to locate or create user for this Stripe session.");
                return res.json({ received: true });
            }

            // RECORD INITIAL PAYMENT (Ensure idempotency)
            const existingPayment = await Payment.findOne({ stripeInvoiceId: session.invoice });
            if (!existingPayment && session.invoice) {
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

        } catch (error) {
            console.error("Error processing checkout session:", error);
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

        console.log("\n--- PROCESSING INVOICE PAYMENT SUCCEEDED ---");
        console.log("Invoice ID:", invoice.id);
        console.log("Customer ID:", invoice.customer);
        console.log("Billing Reason:", invoice.billing_reason);

        // Skip commission generation if it's the initial subscription creation payment
        if (invoice.billing_reason === 'subscription_create') {
            console.log("[Webhook] Skipping recurring commission for initial subscription invoice.");
            return res.json({ received: true });
        }

        try {
            // Find corresponding user
            const user = await User.findOne({ stripeCustomerId: invoice.customer });

            if (user) {
                console.log("Found user for invoice:", user.email);

                user.subscriptionStatus = 'active';
                user.lastPaymentDate = new Date();
                await user.save();

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
                console.log("Recurring payment logged.");

                // --- PROCESS RECURRING COMMISSION ---
                // Find converted referral to attribute recurring commission
                const referral = await Referral.findOne({ referredUserId: user._id, convertedAt: { $ne: null } });
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
                            affiliateId: referral.affiliateId,
                            referralId: referral._id,
                            amount: commissionAmount,
                            status: 'pending',
                        });
                        await commission.save();
                        console.log(`Recurring commission of $${commissionAmount} credited to affiliate.`);
                    }
                }
            } else {
                console.warn("No user found matching stripeCustomerId:", invoice.customer);
            }
        } catch (error) {
            console.error("Error processing invoice.payment_succeeded event");
            console.error(error);
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

        // Retrieve or create User on the fly using Stripe Checkout details
        const { user, isNew } = await getOrCreateUserFromSession(session);

        if (!user) {
            return res.status(404).json({ error: 'User not found and metadata is missing' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'member' }, process.env.JWT_SECRET || 'your_fallback_secret_key', { expiresIn: '7d' });

        // Set cookie for cross-subdomain auto-login
        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.COOKIE_DOMAIN;
        const cookieOptions = {
            httpOnly: false, // Set to false so frontend can read it for cross-subdomain auto-login
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        // Only set domain on production — setting domain on localhost breaks cookies in all browsers
        if (process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        res.cookie('token', token, cookieOptions);

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
