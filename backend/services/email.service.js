const nodemailer = require('nodemailer');
const templates = require('../templates/emailTemplates');

// Helper to strip any enclosing single/double quotes and whitespace from env variables
const cleanEnvVar = (val) => {
    if (!val) return '';
    let trimmed = val.trim();
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        trimmed = trimmed.slice(1, -1);
    }
    return trimmed.trim();
};

const clientId     = cleanEnvVar(process.env.GOOGLE_CLIENT_ID     || process.env.Google_Client_id);
const clientSecret = cleanEnvVar(process.env.GOOGLE_CLIENT_SECRET  || process.env.Google_Client_Secreate);
const refreshToken = cleanEnvVar(process.env.GOOGLE_REFRESH_TOKEN  || process.env.Google_Refresh_Token || process.env['Google-Refresh_Token']);
const googleEmail  = cleanEnvVar(process.env.GOOGLE_EMAIL          || process.env.Google_Email);

let transporter = null;

if (clientId && clientSecret && refreshToken && googleEmail) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: googleEmail,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken
        }
    });
    console.log('[Email Service]: Gmail OAuth2 transporter initialized for', googleEmail);
} else {
    console.error('[Email Service]: CRITICAL — Gmail OAuth2 credentials are missing or incomplete.');
    console.error('  Missing:', [
        !clientId     && 'GOOGLE_CLIENT_ID',
        !clientSecret && 'GOOGLE_CLIENT_SECRET',
        !refreshToken && 'GOOGLE_REFRESH_TOKEN',
        !googleEmail  && 'GOOGLE_EMAIL'
    ].filter(Boolean).join(', '));
}

/**
 * Core Gmail OAuth2 Email Sender
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!transporter) {
        console.error('[Email Service]: Transporter not initialized — email NOT sent to:', to);
        return null;
    }

    try {
        const result = await transporter.sendMail({
            from: `Leak Assure <${googleEmail}>`,
            to,
            subject,
            text: text || '',
            html
        });
        console.log('[Email Sent via Gmail OAuth2]:', result.messageId, '→', to);
        return { id: result.messageId };
    } catch (error) {
        console.error('[Email Service]: Send failed to:', to);
        console.error('[Email Service]: Error code:', error.code);
        console.error('[Email Service]: Error message:', error.message);
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
    
    const userEmailResult = await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: `Welcome to Leak Assure! Your ${planName} has been activated.`
    });

    try {
        await exports.sendNewMemberAdminNotification(user);
    } catch (adminErr) {
        console.error('Failed to send new member admin notification:', adminErr.message);
    }

    return userEmailResult;
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

exports.sendNewMemberAdminNotification = async (user) => {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@leakassure.com';
    const template = templates.adminMemberNotification(user);
    
    return await sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: `New member joined: ${user.fullName} (${user.email}), Plan: ${user.plan}, Address: ${user.serviceAddress}`
    });
};

