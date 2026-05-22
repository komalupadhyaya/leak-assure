/**
 * Premium Email Wrapper for a consistent, high-end look
 */
const premiumWrapper = (content, title = "Leak Assure") => `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
        <div style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="background-color: #2563eb; padding: 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; display: inline-flex; align-items: center;">
                    <span style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 8px; margin-right: 10px;">💧</span>
                    LEAK ASSURE
                </div>
                ${title ? `<h1 style="color: #ffffff; margin-top: 24px; margin-bottom: 0; font-size: 28px; font-weight: 800; line-height: 1.2;">${title}</h1>` : ''}
            </div>
            
            <!-- Body -->
            <div style="padding: 40px; line-height: 1.6; font-size: 16px;">
                ${content}
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 500;">
                    &copy; ${new Date().getFullYear()} Leak Assure. All rights reserved.
                </p>
                <div style="margin-top: 16px;">
                    <a href="https://leakassure.com" style="text-decoration: none; font-size: 13px; font-weight: 600; color: #2563eb; margin: 0 10px;">Website</a>
                    <a href="#" style="text-decoration: none; font-size: 13px; font-weight: 600; color: #2563eb; margin: 0 10px;">Contact Support</a>
                </div>
            </div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;">
            This email was sent to you because you signed up for Leak Assure services.
        </p>
    </div>
`;

exports.welcomeEmail = (name, planName, serviceAddress) => ({
    subject: 'Welcome to Leak Assure: Your Home is Protected!',
    html: premiumWrapper(`
        <p style="margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p>Welcome to the family! We're excited to have you on board. Your home at <strong>${serviceAddress}</strong> is now covered by our <strong>${planName}</strong>.</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 24px; margin: 32px 0; border-radius: 8px;">
            <p style="margin: 0; font-weight: 700; color: #0369a1; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Coverage Details</p>
            <p style="margin: 12px 0 0 0; font-size: 18px; font-weight: 600;">Interior Plumbing Protection</p>
            <p style="margin: 4px 0 0 0; color: #0c4a6e;">Plan: ${planName}</p>
        </div>

        <p>You can manage your account, update your payment details, or file a claim anytime through your personal Member Portal.</p>
        
        <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}" style="background-color: #2563eb; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s ease;">Access Member Portal</a>
        </div>
    `, "Welcome to Leak Assure")
});

exports.affiliateWelcomeEmail = (name, referralLink) => ({
    subject: 'Welcome to the Affiliate Program: Your Link is Ready!',
    html: premiumWrapper(`
        <p style="margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p>Congratulations! Your affiliate account has been successfully created. You're now part of a network helping homeowners protect their assets while earning commissions.</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 32px; margin: 32px 0; border-radius: 16px; text-align: center;">
            <p style="margin: 0; font-weight: 700; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Your Personal Referral Link</p>
            <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 16px; color: #2563eb; font-weight: 700; word-break: break-all;">
                ${referralLink}
            </div>
        </div>

        <p>Log in to your dashboard to track your clicks, earnings, and access marketing materials designed to help you succeed.</p>
        
        <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_AFFILIATE_URL || 'https://affiliates.leakassure.com'}" style="background-color: #2563eb; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block;">Affiliate Dashboard</a>
        </div>
    `, "Affiliate Partnership")
});

exports.adminAffiliateNotification = (affiliate) => ({
    subject: `New Affiliate Signup: ${affiliate.name}`,
    html: premiumWrapper(`
        <p style="margin-top: 0;">A new partner has joined the Leak Assure Affiliate Program.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; margin: 24px 0; border-radius: 12px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Affiliate Name</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${affiliate.name}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Email Address</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${affiliate.email}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-size: 14px;">Signup Date</td>
                    <td style="font-weight: 700; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_ADMIN_URL || 'https://admin.leakassure.com'}/admin/affiliates" style="background-color: #1e293b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Review Application</a>
        </div>
    `, "New Affiliate Registration")
});

exports.adminMemberNotification = (user) => ({
    subject: `New Member Joined: ${user.fullName}`,
    html: premiumWrapper(`
        <p style="margin-top: 0;">A new member has completed their registration and joined Leak Assure.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; margin: 24px 0; border-radius: 12px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Member Name</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${user.fullName}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Email Address</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${user.email}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Phone Number</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${user.phone || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Service Address</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right;">${user.serviceAddress || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Selected Plan</td>
                    <td style="padding-bottom: 12px; font-weight: 700; text-align: right; text-transform: capitalize;">${user.plan || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-size: 14px;">Signup Date</td>
                    <td style="font-weight: 700; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_ADMIN_URL || 'https://admin.leakassure.com'}/admin/members" style="background-color: #1e293b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View Member Details</a>
        </div>
    `, "New Member Registration")
});


exports.affiliateStatusEmail = (name, status) => {
    const isApproved = status === 'approved';
    const statusText = isApproved ? 'Approved!' : 'Rejected';
    const subject = isApproved ? 'Welcome to the Leak Assure Affiliate Program!' : 'Update regarding your Affiliate Application';
    
    return {
        subject: subject,
        html: premiumWrapper(`
            <p>Hi ${name},</p>
            <p>Your affiliate application has been <strong>${status}</strong>.</p>
            ${isApproved 
                ? `<p>You can now log in to your dashboard to access your referral link and start earning commissions!</p>
                   <div style="text-align: center; margin-top: 32px;">
                       <a href="${process.env.FRONTEND_AFFILIATE_URL || 'https://affiliates.leakassure.com'}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
                   </div>` 
                : '<p>Unfortunately, we cannot accept your application at this time.</p>'}
        `, `Application ${statusText}`)
    };
};

exports.paymentFailedEmail = (name) => ({
    subject: 'Action Required: Payment Processing Error',
    html: premiumWrapper(`
        <p>Hi ${name}, we encountered an issue processing your recent payment.</p>
        <p>To ensure your protection remains active without interruption, please update your payment method as soon as possible.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_MEMBER_URL || 'https://member.leakassure.com'}/login" style="background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 700;">Update Payment Info</a>
        </div>
    `, "Payment Failed")
});

exports.payoutEmail = (name, amount, method) => ({
    subject: 'Success: Your Commission has been Sent!',
    html: premiumWrapper(`
        <p>Hi ${name}, great news! We have processed your commission payment.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #166534;">$${amount}</p>
            <p style="margin: 4px 0 0 0; color: #15803d; font-weight: 600;">Sent via ${method.toUpperCase()}</p>
        </div>
    `, "Commission Paid")
});
