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
        let commissions = await Commission.find({ affiliateId: affiliate._id });
        
        // --- AUTO-REPAIR: Check for active referrals missing commissions ---
        const activeReferrals = await Referral.find({ 
            affiliateId: affiliate._id 
        }).populate('referredUserId');

        for (const ref of activeReferrals) {
            if (ref.referredUserId?.subscriptionStatus === 'active') {
                const hasCommission = commissions.find(c => c.referralId.toString() === ref._id.toString());
                if (!hasCommission) {
                    console.log(`[Auto-Repair] Creating missing commission for referral: ${ref._id}`);
                    
                    let amount = affiliate.commissionValue || 20;
                    if (affiliate.commissionType === 'percentage') {
                        const planPrice = ref.referredUserId.planPrice || (ref.referredUserId.plan === 'premium' ? 49 : 29);
                        amount = (planPrice * amount) / 100;
                    }

                    const newComm = new Commission({
                        affiliateId: affiliate._id,
                        referralId: ref._id,
                        amount: amount,
                        status: 'pending'
                    });
                    await newComm.save();
                    // Refresh commissions list
                    commissions = await Commission.find({ affiliateId: affiliate._id });
                }
            }
        }

        const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
        const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
        const availableBalance = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);
        const totalReferrals = await Referral.countDocuments({ affiliateId: affiliate._id });

        return res.json({
            affiliate,
            referralLink: affiliate.referralSlug 
                ? `${SIGNUP_BASE_URL}/${affiliate.referralSlug}`
                : `${SIGNUP_BASE_URL}/?ref=${affiliate.referralCode}`,
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
            .populate('referredUserId', 'fullName email subscriptionStatus');

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
            .populate({
                path: 'referralId',
                populate: {
                    path: 'referredUserId',
                    select: 'fullName email'
                }
            });

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
