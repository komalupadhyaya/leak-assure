const nodemailer = require('nodemailer');
const templates = require('../templates/emailTemplates');

let transporter;

const getTransporter = () => {
    if (!transporter) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error("CRITICAL: SMTP configuration (USER/PASS) is missing from environment.");
            throw new Error("SMTP is not configured.");
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });


    }
    return transporter;
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'support@leakassure.com';

/**
 * Core SMTP Sender Helper
 */
const sendEmail = async ({ to, subject, html, text }) => {
    
    
    try {
        const mailTransporter = getTransporter();
        
        
        const info = await mailTransporter.sendMail({
            from: `Leak Assure <${EMAIL_FROM}>`,
            to,
            subject,
            text,
            html,
        });

        
        return info;
    } catch (error) {
        console.error('[Email Service Exception]:', error.message);
        console.error(error.stack);
        return null;
    } finally {
        
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
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #2563eb; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Claim Registered</h1>
                    <p style="color: #bfdbfe; margin-top: 8px; font-size: 16px;">Claim ID: #${claimId}</p>
                </div>
                
                <div style="padding: 40px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi ${name},</p>
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">We have received your claim for <strong>${issueType}</strong>. Our team of specialists is currently reviewing the details and will contact you shortly to coordinate the repair.</p>
                    
                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 16px 0;">What Happens Next?</h2>
                        <ol style="padding-left: 20px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                            <li>A Case Manager will review your photos and description.</li>
                            <li>A local pro will be dispatched to your service address.</li>
                            <li>We will handle the coordination and payment directly.</li>
                        </ol>
                    </div>

                    <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5; text-align: center;">If you have immediate questions, please call our 24/7 hotline with your Claim ID: #${claimId}</p>
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
            <p>Hi ${name},</p>
            <p>Your protection plan is active. Use the credentials below to log in:</p>
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
    const portalUrl = `${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}`;
    const planDetails = user.plan === 'premium' ? {
        name: 'Premium Protection Plan',
        price: '$49/month',
        serviceFee: '$100'
    } : {
        name: 'Essential Protection Plan',
        price: '$29/month',
        serviceFee: '$150'
    };

    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #2563eb; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">You're Protected</h1>
                    <p style="color: #bfdbfe; margin-top: 8px; font-size: 16px;">Welcome to Leak Assure, ${user.fullName.split(' ')[0]}!</p>
                </div>
                
                <div style="padding: 40px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Your protection plan has been successfully activated. We are thrilled to have you as a member and are committed to keeping your home leak-free.</p>
                    
                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 16px 0;">Protection Summary</h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Plan Type</td>
                                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${planDetails.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Monthly Installment</td>
                                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${planDetails.price}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Fee</td>
                                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${planDetails.serviceFee} per visit</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Service Address</td>
                                <td style="padding: 8px 0; font-size: 14px; font-weight: 700; text-align: right;">${user.serviceAddress}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center;">
                        <a href="${portalUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25);">Access Member Portal</a>
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">Important Coverage Note:</p>
                        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">Per your terms, your protection is subject to a 30-day waiting period. Any leaks occurring before ${user.waitingPeriodEnd ? new Date(user.waitingPeriodEnd).toLocaleDateString() : '30 days from today'} are not eligible for coverage.</p>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 32px; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Leak Assure Home Protection. All rights reserved.</p>
                    <p style="font-size: 10px; color: #cbd5e1; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px;">This is a service contract. This is not insurance.</p>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({
        to: user.email,
        subject: "Welcome to Leak Assure: Your Home is Protected!",
        html,
        text: `Welcome to Leak Assure! Your ${planDetails.name} has been activated for ${user.serviceAddress}.`
    });
};
