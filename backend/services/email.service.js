const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let resendClient;
const getResendClient = () => {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            console.error("CRITICAL: RESEND_API_KEY is missing from environment.");
            throw new Error("RESEND_API_KEY is not configured.");
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

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
    const loginUrl = `${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}/login`;
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


exports.sendEnrollmentConfirmationEmail = async (user) => {
    const isProduction = process.env.APP_ENV === 'production';
    const adminEmail = process.env.EMAIL_RECEIVER || "komalsoftiatric@gmail.com";
    const portalUrl = process.env.MEMBER_PORTAL || `${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}/login`;
    const fromEmail = process.env.EMAIL_FROM || (isProduction ? 'noreply@leakassure.com' : 'onboarding@resend.dev');

    try {
        console.log("Preparing enrollment confirmation email for:", user.email);

        const planDetails = user.plan === 'premium' ? {
            name: 'Premium Protection',
            price: '$49/month',
            limit: '$2,000 per incident',
            claims: 'Maximum 3 claims per year',
            fee: '$49 service fee per claim'
        } : {
            name: 'Essential Protection',
            price: '$29/month',
            limit: '$1,000 per incident',
            claims: 'Maximum 2 claims per year',
            fee: '$99 service fee per claim'
        };

        const generateHtml = (isFallback = false) => `
            <!DOCTYPE html>
            <html>  
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
                    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f4f8; }
                    .badge { display: inline-block; background-color: #e6fffa; color: #2c7a7b; padding: 8px 16px; border-radius: 9999px; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
                    .hero-text { font-size: 24px; font-weight: bold; color: #1a202c; margin-bottom: 10px; }
                    .section { margin: 25px 0; }
                    .details-box { background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                    .detail-label { color: #718096; }
                    .detail-value { font-weight: 600; color: #2d3748; }
                    .coverage-box { background-color: #ebf8ff; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; }
                    .coverage-title { font-weight: bold; color: #2b6cb0; margin-bottom: 5px; }
                    .coverage-list { margin: 0; padding-left: 20px; font-size: 14px; }
                    .button { display: block; width: 220px; margin: 30px auto; background-color: #2b6cb0; color: #ffffff !important; text-align: center; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; }
                    .notice { font-size: 13px; color: #718096; font-style: italic; text-align: center; }
                    .footer { font-size: 11px; color: #a0aec0; text-align: center; margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; }
                    .fallback-notice { background-color: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${isFallback ? `
                    <div class="fallback-notice">
                        <strong>Notice:</strong> This email was redirected to the monitoring inbox because the Resend account is still in testing mode and cannot send to external recipients.<br>
                        <strong>Original Recipient:</strong> ${user.email}
                    </div>` : ''}
                    <div class="header">
                        <div class="badge">✓ ACTIVATED</div>
                        <div class="hero-text">You're Covered</div>
                        <p style="color: #4a5568;">Your Leak Assure protection plan has been successfully activated.</p>
                    </div>
                    <div class="section">
                        <div class="details-box">
                            <div class="detail-row">
                                <span class="detail-label">Full Name:</span>
                                <span class="detail-value">${user.fullName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Service Address:</span>
                                <span class="detail-value">${user.serviceAddress}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Selected Plan:</span>
                                <span class="detail-value">${planDetails.name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Monthly Price:</span>
                                <span class="detail-value">${planDetails.price}/month</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Effective Date:</span>
                                <span class="detail-value">${user.activatedAt ? new Date(user.activatedAt).toLocaleDateString() : 'Immediate'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="coverage-box">
                        <div class="coverage-title">${planDetails.name} Summary</div>
                        <ul class="coverage-list">
                            <li>${planDetails.limit} coverage per incident</li>
                            <li>${planDetails.claims}</li>
                            <li>${planDetails.fee} per claim</li>
                        </ul>
                    </div>

                    <div class="section" style="text-align: center;">
                        <p style="font-weight: bold; color: #e53e3e;">Waiting Period Notice</p>
                        <p style="font-size: 14px; color: #718096;">Coverage begins after the 30-day waiting period (${user.waitingPeriodEnd ? new Date(user.waitingPeriodEnd).toLocaleDateString() : 'N/A'}).</p>
                    </div>

                    <div class="section">
                        <p style="font-weight: bold; color: #2d3748;">What happens next?</p>
                        <ul style="font-size: 14px; color: #4a5568; line-height: 1.6;">
                            <li>Check your email for confirmation</li>
                            <li>Save your coverage details for your records</li>
                            <li>Use the Member Portal to file claims</li>
                        </ul>
                    </div>

                    <a href="${portalUrl}" class="button">Access Member Portal</a>

                    <div class="footer">
                        <p><strong>THIS IS A SERVICE CONTRACT. THIS IS NOT INSURANCE.</strong></p>
                        <p>Coverage is subject to the Leak Assure Service Contract Policy and plan limitations.</p>
                        <p>&copy; ${new Date().getFullYear()} Leak Assure. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const resend = getResendClient();

        console.log("Attempting to send email to member:", user.email);

        const primaryMailOptions = {
            from: fromEmail,
            to: isProduction ? user.email : [user.email, adminEmail],
            bcc: isProduction ? adminEmail : undefined,
            subject: isProduction
                ? "You're Covered: Leak Assure Enrollment Confirmation"
                : `[DEV] You're Covered: Leak Assure Enrollment Confirmation`,
            html: generateHtml(false)
        };

        const { data, error } = await resend.emails.send(primaryMailOptions);

        if (error) {
            // Check if it's a Resend validation error related to testing mode
            const isBlockedError = error.name === 'validation_error' ||
                (error.message && error.message.includes("testing emails to your own email address"));

            if (!isProduction && isBlockedError) {
                console.log("Email blocked by Resend. Sending fallback to monitoring email:", adminEmail);

                const fallbackMailOptions = {
                    from: fromEmail,
                    to: adminEmail,
                    subject: `[TEST MODE] Enrollment Confirmation for ${user.email}`,
                    html: generateHtml(true)
                };

                const fallbackResult = await resend.emails.send(fallbackMailOptions);

                if (fallbackResult.error) {
                    throw new Error(`Fallback email delivery failed: ${fallbackResult.error.message}`);
                }

                return fallbackResult.data;
            }

            console.error("RESEND ERROR:", error);
            throw new Error(`Email delivery failed: ${error.message}`);
        }

        console.log("Enrollment confirmation email sent to:", user.email);
        if (isProduction || !isProduction) {
            console.log("Monitoring copy sent to:", adminEmail);
        }
        return data;

    } catch (err) {
        console.error("EMAIL SERVICE ERROR:", err);
        throw err;
    }
};
