const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const Affiliate = require('../models/Affiliate');
const SystemSettings = require('../models/SystemSettings');
const emailService = require('../services/email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    paypalEmail: z.string().email('PayPal email is required'),
    zelleInfo: z.union([z.string(), z.literal(''), z.undefined()]).optional(),
});

exports.affiliateSignup = async (req, res) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
    }

    const { name, email, password, paypalEmail, zelleInfo } = result.data;

    try {
        const existing = await Affiliate.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Fetch global commission settings to initialize new affiliate
        let commissionType = 'percentage';
        let commissionValue = 20;
        try {
            const settings = await SystemSettings.findOne({ key: 'globalAffiliateCommission' });
            if (settings && settings.value) {
                commissionType = settings.value.commissionType;
                commissionValue = settings.value.commissionValue;
            }
        } catch (settingsErr) {
            console.error('[AffiliateSignup] Failed to fetch global settings, falling back to defaults:', settingsErr.message);
        }

        const affiliate = new Affiliate({ 
            name, 
            email, 
            password: hashedPassword, 
            paypalEmail, 
            zelleInfo,
            commissionType,
            commissionValue
        });
        await affiliate.save();

        // Generate and save the personalized referral slug separately (safe, outside save hook)
        try {
            const slug = await Affiliate.generateUniqueSlug(name);
            if (slug) {
                affiliate.referralSlug = slug;
                await affiliate.save();
            }
        } catch (slugErr) {
            // Non-critical: slug generation failure should not block signup
            console.error('[AffiliateSignup] Slug generation error (non-critical):', slugErr.message);
        }

        // Send notifications
        try {
            await emailService.sendAffiliateWelcomeEmail(affiliate);
            await emailService.sendNewAffiliateAdminNotification(affiliate);
        } catch (emailErr) {
            console.error('[AffiliateSignup] Email Error:', emailErr.message);
        }

        return res.status(201).json({
            message: 'Account created. Your application is pending admin approval.',
            status: 'pending'
        });
    } catch (err) {
        console.error('[AffiliateSignup] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.affiliateLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const affiliate = await Affiliate.findOne({ email: email.toLowerCase() });
        if (!affiliate) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, affiliate.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (affiliate.status !== 'approved') {
            return res.status(403).json({
                error: affiliate.status === 'pending'
                    ? 'Your account is pending approval. Please check back soon.'
                    : 'Your account has been rejected. Please contact support.'
            });
        }

        const token = jwt.sign(
            { id: affiliate._id, email: affiliate.email, role: 'affiliate' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('affiliate_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            affiliate: {
                id: affiliate._id,
                name: affiliate.name,
                email: affiliate.email,
                status: affiliate.status,
                referralCode: affiliate.referralCode,
            }
        });
    } catch (err) {
        console.error('[AffiliateLogin] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.affiliateLogout = (req, res) => {
    res.clearCookie('affiliate_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};

exports.getAffiliateBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const affiliate = await Affiliate.findOne({ referralSlug: slug, status: 'approved' });
        if (!affiliate) {
            return res.status(404).json({ error: 'Affiliate not found' });
        }
        return res.json({ referralCode: affiliate.referralCode });
    } catch (err) {
        console.error('[AffiliateSlug] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
