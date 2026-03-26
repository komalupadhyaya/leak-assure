const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const Affiliate = require('../models/Affiliate');

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
        const affiliate = new Affiliate({ name, email, password: hashedPassword, paypalEmail, zelleInfo });
        await affiliate.save();

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

        return res.json({
            token,
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
