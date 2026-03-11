const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

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

        console.log("Webhook verification SUCCESS");
        console.log("Event Type:", event.type);

    } catch (err) {

        console.error("Webhook signature verification FAILED");
        console.error(err.message);

        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Stripe webhook received:", event.type);

    if (event.type === 'checkout.session.completed') {

        const session = event.data.object;

        console.log("\n--- PROCESSING CHECKOUT SESSION ---");

        console.log("Session ID:", session.id);
        console.log("Customer ID:", session.customer);
        console.log("Subscription ID:", session.subscription);
        console.log("Amount Total:", session.amount_total);
        console.log("Metadata Email:", session.metadata?.email);

        try {
            const user = await User.findOne({
                $or: [
                    { stripeCustomerId: session.customer },
                    { email: session.metadata?.email }
                ]
            });

            console.log("Customer ID:", session.customer);
            console.log("Metadata Email:", session.metadata?.email);
            console.log("User Lookup Result:", user ? `FOUND (${user.email})` : "NOT FOUND");

            if (!user) {
                console.warn("No user matched this Stripe session.");
                return res.json({ received: true });
            }

            if (user.subscriptionStatus === 'active') {
                console.log("User already active. Skipping duplicate webhook.");
                return res.json({ received: true });
            }

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

            let sendCredentials = false;
            let tempPassword = '';

            if (!user.password) {
                console.log("User has no password. Generating temporary credentials.");
                const crypto = require('crypto');
                const bcrypt = require('bcryptjs');
                tempPassword = crypto.randomBytes(4).toString('hex');
                const hashedPassword = await bcrypt.hash(tempPassword, 10);
                user.password = hashedPassword;
                user.forcePasswordChange = true;
                sendCredentials = true;
            }

            await user.save();
            console.log("User successfully activated via webhook:", user.email);

            const emailService = require('../services/email.service');

            // --- SEND ENROLLMENT CONFIRMATION EMAIL (RESEND) ---
            if (!user.confirmationEmailSent) {
                console.log("Sending enrollment confirmation email");
                try {
                    await emailService.sendEnrollmentConfirmationEmail(user);
                    user.confirmationEmailSent = true;
                    await user.save();
                    console.log("Confirmation email sent successfully");
                } catch (emailError) {
                    console.error("EMAIL DELIVERY FAILED");
                    console.error(emailError);
                    // Do not break the webhook, just log it.
                }
            } else {
                console.log("Enrollment email already sent, skipping duplicate.");
            }

            // --- LEGACY EMAIL CALLS (kept for credentials if needed) ---
            if (sendCredentials) {
                console.log("Sending additional login credentials email");
                emailService.sendLoginCredentials(
                    user.email,
                    user.fullName,
                    tempPassword
                );
            }

        } catch (error) {

            console.error("ERROR during checkout.session.completed processing");
            console.error(error);

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

            } else {

                console.warn("No user found for failed invoice customer:", invoice.customer);

            }

        } catch (error) {

            console.error("Error handling invoice.payment_failed");
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

        res.json({
            name: user.fullName,
            serviceAddress: user.serviceAddress,
            plan: user.plan,
            price: user.planPrice || (user.plan === 'premium' ? 49 : 29),
            waitingPeriodEnd: user.waitingPeriodEnd
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
            return_url: `${process.env.FRONTEND_URL}/member/settings`,
        });

        console.log("Billing portal session created for:", user.email);

        res.json({ url: session.url });

    } catch (error) {

        console.error("Error creating billing portal session:", error);

        res.status(500).json({ error: 'Failed to create billing portal' });
    }

};
