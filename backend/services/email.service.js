const nodemailer = require('nodemailer');

// For production, use real SMTP credentials.
// For testing, this will log to console if variables are missing.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password',
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER) {
            console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject} | Content: ${text}`);
            return;
        }
        await transporter.sendMail({
            from: '"Leak Assure" <no-reply@leakassure.com>',
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.sendSignupConfirmation = (email, name) => {
    const subject = 'Welcome to Leak Assure Protection!';
    const text = `Hi ${name}, thank you for joining Leak Assure. Your home is now protected.`;
    const html = `<h1>Welcome to Leak Assure!</h1><p>Hi ${name}, your protection is now active.</p>`;
    sendEmail(email, subject, text, html);
};

exports.sendClaimConfirmation = (email, name, issueType) => {
    const subject = `Claim Received: ${issueType}`;
    const text = `Hi ${name}, we have received your claim for ${issueType}. Our team is reviewing it now.`;
    const html = `<h2>Claim Received</h2><p>We are processing your ${issueType} request.</p>`;
    sendEmail(email, subject, text, html);
};

exports.sendClaimStatusUpdate = (email, name, status) => {
    const subject = `Claim Update: ${status}`;
    const text = `Hi ${name}, your claim status has been updated to: ${status}.`;
    const html = `<h2>Claim Status Update</h2><p>Your claim is now: <strong>${status}</strong></p>`;
    sendEmail(email, subject, text, html);
};

exports.sendCancellationNotice = (email, name) => {
    const subject = 'Subscription Canceled';
    const text = `Hi ${name}, your Leak Assure subscription has been canceled.`;
    const html = `<h2>Subscription Canceled</h2><p>We're sorry to see you go.</p>`;
    sendEmail(email, subject, text, html);
};

exports.sendLoginCredentials = (email, name, tempPassword) => {
    const subject = 'Welcome to Leak Assure — Your Account is Ready';
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const text = `Hello ${name},

Your Leak Assure protection plan has been activated.

You can now access the Member Portal using the credentials below:

Email: ${email}
Temporary Password: ${tempPassword}

Login here:
${loginUrl}

For security, please change your password after logging in.`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #1e293b;">Welcome to Leak Assure!</h2>
            <p>Hello ${name},</p>
            <p>Your Leak Assure protection plan has been activated. You can now access the Member Portal using the credentials below:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            <p>
                <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Member Portal</a>
            </p>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 20px;">For security, please change your password after logging in.</p>
        </div>
    `;
    sendEmail(email, subject, text, html);
};

