const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const emailService = require('../services/email.service');
const User = require('../models/User');

// Important: Webhook must use express.raw middleware to verify signature
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    console.log("POST /api/stripe/webhook hit");
    stripeController.handleWebhook(req, res, next);
});

// Diagnostic route
router.get('/webhook', (req, res) => {
    res.json({
        status: "active",
        message: "Stripe webhook endpoint is reachable via GET. Use POST for actual webhooks.",
        timestamp: new Date().toISOString()
    });
});

router.get('/session/:sessionId', stripeController.getSessionDetails);

// Manual Email Test Route
router.get('/test-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email query param required" });
        
        console.log(`[Manual Test] Triggering test email to: ${email}`);
        const result = await emailService.sendEmail({
            to: email,
            subject: "Leak Assure Diagnostic Test",
            html: "<h1>Test Successful</h1><p>This email confirms that the SMTP service is correctly configured and reachable from the backend.</p>",
            text: "SMTP connectivity test successful."
        });
        
        if (result) {
            res.json({ success: true, message: "Email sent successfully", messageId: result.messageId });
        } else {
            res.status(500).json({ success: false, message: "SMTP failed. Check backend console for error details." });
        }
    } catch (error) {
        console.error("[Manual Test Error]:", error);
        res.status(500).json({ error: error.message });
    }
});

// Manual Enrollment Email Test Route
router.get('/test-enrollment-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email query param required" });
        
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ error: "User not found in DB" });
        
        console.log(`[Simulation] Triggering enrollment email for: ${user.email} (ID: ${user._id})`);
        
        const result = await emailService.sendEnrollmentConfirmationEmail(user);
        
        if (result) {
            // Update the DB flag if successful
            user.confirmationEmailSent = true;
            await user.save();
            res.json({ 
                success: true, 
                message: "Enrollment email sent and DB updated", 
                messageId: result.messageId,
                userData: {
                    email: user.email,
                    confirmationEmailSent: user.confirmationEmailSent
                }
            });
        } else {
            res.status(500).json({ success: false, message: "Enrollment email failed inside service. Check logs." });
        }
    } catch (error) {
        console.error("[Simulation Error]:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
