const { Resend } = require('resend');
require('dotenv').config();

async function testEmail() {
    console.log("--- Resend Diagnostic ---");
    console.log("API Key:", process.env.RESEND_API_KEY ? "PRESENT" : "MISSING");
    console.log("From Address:", process.env.EMAIL_FROM || "noreply@leakassure.com");

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_1234')) {
        console.error("ERROR: You are still using a placeholder Resend API Key.");
        console.error("Please update backend/.env with your real key.");
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        console.log("Attempting to send test email...");
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: "komalsoftiatric@gmail.com", // You can change this
            subject: "Resend Connection Test",
            html: "<h1>Connection Successful</h1><p>The Leak Assure backend can now send transactional emails!</p>"
        });

        if (error) {
            console.error("RESEND REJECTED THE REQUEST:");
            console.error(error);
        } else {
            console.log("SUCCESS! Email sent. ID:", data.id);
        }
    } catch (err) {
        console.error("CRITICAL ERROR DURING SENDING:");
        console.error(err);
    }
}

testEmail();
