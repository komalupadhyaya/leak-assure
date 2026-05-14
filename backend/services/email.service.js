const { Resend } = require('resend');
const templates = require('../templates/emailTemplates');

let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Core Resend Email Sender Helper
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error("CRITICAL: RESEND_API_KEY is missing from environment variables.");
            return null;
        }

        if (!resend) {
            resend = new Resend(process.env.RESEND_API_KEY);
        }

        const result = await resend.emails.send({
            from: `Leak Assure <${EMAIL_FROM}>`,
            to,
            subject,
            text: text || '',
            html: html
        });

        if (result.error) {
            console.error('[Resend Error]:', result.error);
            throw new Error(result.error.message);
        }

        console.log('[Email Sent via Resend]:', result.data.id);
        return result.data;
    } catch (error) {
        console.error('[Email Service Exception]:', error.message);
        return null;
    }
};

exports.sendEmail = sendEmail;

exports.sendSignupConfirmation = async (email, name) => {
    const template = templates.welcomeEmail(name);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, welcome to Leak Assure!`
    });
};

exports.sendClaimConfirmation = async (email, name, issueType, claimId) => {
    const subject = `Claim Received: #${claimId.toString().slice(-6).toUpperCase()} - ${issueType}`;
    
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #2563eb; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Claim Registered</h1>
                    <p style="color: #bfdbfe; margin-top: 8px; font-size: 16px;">Claim ID: #${claimId}</p>
                </div>
                <div style="padding: 40px;">
                    <p>Hi ${name}, we have received your claim for <strong>${issueType}</strong>.</p>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject,
        html,
        text: `Hi ${name}, we received your claim #${claimId} for ${issueType}.`
    });
};

exports.sendClaimStatusUpdate = async (email, name, status) => {
    const subject = `Claim Update: ${status}`;
    const html = `<h2>Claim Status Update</h2><p>Hi ${name}, your claim is now: <strong>${status}</strong></p>`;
    return await sendEmail({
        to: email,
        subject,
        html,
        text: `Hi ${name}, your claim status is now ${status}.`
    });
};

exports.sendCancellationNotice = async (email, name) => {
    const template = templates.cancellationEmail(name);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, your subscription has been cancelled.`
    });
};

exports.sendPaymentFailedNotice = async (email, name) => {
    const template = templates.paymentFailedEmail(name);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, your payment failed. Please update your details.`
    });
};

exports.sendAffiliateStatusUpdate = async (email, name, status) => {
    const template = templates.affiliateStatusEmail(name, status);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, your affiliate status is now ${status}.`
    });
};

exports.sendPayoutConfirmation = async (email, name, amount, method) => {
    const template = templates.payoutEmail(name, amount, method);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, your payout of $${amount} via ${method} is confirmed.`
    });
};

exports.sendLoginCredentials = async (email, name, tempPassword) => {
    const loginUrl = `${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}/login`;
    const subject = 'Your Leak Assure Account is Ready';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Welcome to Leak Assure!</h2>
            <p>Hi ${name}, your temporary credentials are:</p>
            <p><strong>Email:</strong> ${email}<br><strong>Password:</strong> ${tempPassword}</p>
            <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login Now</a>
        </div>
    `;
    return await sendEmail({
        to: email,
        subject,
        html,
        text: `Login at ${loginUrl} with password ${tempPassword}`
    });
};

exports.sendEnrollmentConfirmationEmail = async (user) => {
    const planName = user.plan === 'premium' ? 'Premium Protection Plan' : 'Essential Protection Plan';
    const template = templates.welcomeEmail(user.fullName, planName, user.serviceAddress);
    
    return await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: `Welcome to Leak Assure! Your ${planName} has been activated.`
    });
};

exports.sendAffiliateWelcomeEmail = async (affiliate) => {
    const signupUrl = process.env.FRONTEND_SIGNUP_URL || 'https://signup.leakassure.com';
    const referralLink = affiliate.referralSlug 
        ? `${signupUrl}/${affiliate.referralSlug}`
        : `${signupUrl}/?ref=${affiliate.referralCode}`;
        
    const template = templates.affiliateWelcomeEmail(affiliate.name, referralLink);
    
    return await sendEmail({
        to: affiliate.email,
        subject: template.subject,
        html: template.html,
        text: `Welcome! Your referral link is: ${referralLink}`
    });
};

exports.sendNewAffiliateAdminNotification = async (affiliate) => {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@leakassure.com';
    const template = templates.adminAffiliateNotification(affiliate);
    
    return await sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: `New affiliate signup: ${affiliate.name} (${affiliate.email})`
    });
};
