exports.welcomeEmail = (name) => ({
    subject: 'Welcome to Leak Assure Protection!',
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #2563eb;">Welcome to Leak Assure!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for choosing Leak Assure. Your home is now protected with our interior plumbing coverage.</p>
            <p>You can manage your protection and file claims anytime through our Member Portal.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Leak Assure Team</p>
        </div>
    `
});

exports.paymentFailedEmail = (name) => ({
    subject: 'Action Required: Payment Failed',
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #dc2626;">Payment Failed</h1>
            <p>Hi ${name},</p>
            <p>We were unable to process your recent payment for your Leak Assure subscription.</p>
            <p>To keep your protection active, please update your payment method in the Member Portal as soon as possible.</p>
            <a href="https://member.leakassure.com/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Update Payment Method</a>
            <p style="margin-top: 30px;">Thank you,<br>The Leak Assure Team</p>
        </div>
    `
});

exports.cancellationEmail = (name) => ({
    subject: 'Leak Assure Subscription Cancelled',
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1>Subscription Cancelled</h1>
            <p>Hi ${name},</p>
            <p>Your Leak Assure subscription has been cancelled. Your protection will remain active until the end of your current billing period.</p>
            <p>We're sorry to see you go. If this was a mistake, you can reactivate your plan anytime through the Member Portal.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Leak Assure Team</p>
        </div>
    `
});

exports.affiliateStatusEmail = (name, status) => ({
    subject: `Affiliate Application Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1>Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
            <p>Hi ${name},</p>
            <p>Your application to the Leak Assure Affiliate Program has been <strong>${status}</strong>.</p>
            ${status === 'approved' 
                ? '<p>You can now log in to the Affiliate Portal to access your referral links and assets.</p><a href="https://affiliates.leakassure.com/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Go to Affiliate Portal</a>' 
                : '<p>If you have any questions, please reply to this email.</p>'}
            <p style="margin-top: 30px;">Thank you,<br>The Leak Assure Team</p>
        </div>
    `
});

exports.payoutEmail = (name, amount, method) => ({
    subject: 'Commission Payment Confirmed',
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #16a34a;">Payment Confirmed</h1>
            <p>Hi ${name},</p>
            <p>We've successfully processed a commission payment of <strong>$${amount}</strong> to your ${method} account.</p>
            <p>Log in to your Affiliate Portal to see your full earnings history.</p>
            <p style="margin-top: 30px;">Thank you for your partnership,<br>The Leak Assure Team</p>
        </div>
    `
});
