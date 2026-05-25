const { google } = require('googleapis');
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

let gmailClient = null;

if (clientId && clientSecret && refreshToken && googleEmail) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret
        );

        oauth2Client.setCredentials({
            refresh_token: refreshToken
        });

        gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
        console.log('[Email Service]: Gmail REST API client initialized for', googleEmail);
    } catch (initErr) {
        console.error('[Email Service]: Failed to initialize Gmail REST API client:', initErr.message);
    }
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
 * Helper to construct the base64url encoded RFC 822 formatted email message
 */
const makeBody = (to, from, subject, htmlBody) => {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `From: Leak Assure <${from}>`,
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        htmlBody
    ];
    const message = messageParts.join('\r\n');

    // The Gmail API requires base64url encoding (replace + with -, / with _, and remove trailing =)
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Core Gmail REST API Email Sender
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!gmailClient) {
        console.error('[Email Service]: Gmail REST API client not initialized — email NOT sent to:', to);
        return null;
    }

    try {
        const raw = makeBody(to, googleEmail, subject, html);
        
        const result = await gmailClient.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: raw
            }
        });

        console.log('[Email Sent via Gmail REST API]:', result.data.id, '→', to);
        return { id: result.data.id };
    } catch (error) {
        console.error('[Email Service]: Send failed to:', to);
        console.error('[Email Service]: Error details:', error.response?.data || error.message);
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
    const template = templates.claimConfirmationEmail(name, claimId, issueType);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
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
    const template = templates.loginCredentialsEmail(name, email, tempPassword);
    return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: `Hi ${name}, welcome to Leak Assure! Your temporary password is: ${tempPassword}`
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

