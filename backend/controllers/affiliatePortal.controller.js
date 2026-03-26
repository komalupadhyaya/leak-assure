const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Creative = require('../models/Creative');

const SIGNUP_BASE_URL = process.env.FRONTEND_SIGNUP_URL || 'https://signup.leakassure.com';

// GET /api/affiliate/me
exports.getMe = async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.affiliate.id).select('-password');
        if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

        // Earnings summary
        const commissions = await Commission.find({ affiliateId: affiliate._id });
        const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
        const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
        const availableBalance = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);
        const totalReferrals = await Referral.countDocuments({ affiliateId: affiliate._id });

        return res.json({
            affiliate,
            referralLink: `${SIGNUP_BASE_URL}/?ref=${affiliate.referralCode}`,
            earnings: { totalEarnings, paidEarnings, availableBalance, totalReferrals }
        });
    } catch (err) {
        console.error('[AffiliatePortal.getMe]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/affiliate/referrals
exports.getReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ affiliateId: req.affiliate.id })
            .sort({ createdAt: -1 })
            .populate('referredUserId', 'fullName email');

        return res.json(referrals);
    } catch (err) {
        console.error('[AffiliatePortal.getReferrals]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/affiliate/commissions
exports.getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find({ affiliateId: req.affiliate.id })
            .sort({ createdAt: -1 })
            .populate('referralId');

        return res.json(commissions);
    } catch (err) {
        console.error('[AffiliatePortal.getCommissions]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/affiliate/creatives
exports.getCreatives = async (req, res) => {
    try {
        const creatives = await Creative.find().sort({ uploadedAt: -1 });
        return res.json(creatives);
    } catch (err) {
        console.error('[AffiliatePortal.getCreatives]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/affiliate/settings
exports.updateSettings = async (req, res) => {
    try {
        const { paypalEmail, zelleInfo } = req.body;
        const affiliate = await Affiliate.findByIdAndUpdate(
            req.affiliate.id,
            { paypalEmail, zelleInfo },
            { new: true }
        ).select('-password');

        return res.json(affiliate);
    } catch (err) {
        console.error('[AffiliatePortal.updateSettings]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
