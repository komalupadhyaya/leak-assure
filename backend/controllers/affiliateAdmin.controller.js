const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Creative = require('../models/Creative');

// GET /api/admin/affiliates
exports.getAllAffiliates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const status = req.query.status; // optional filter

        const query = status ? { status } : {};
        const total = await Affiliate.countDocuments(query);
        const affiliates = await Affiliate.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Attach commission totals
        const enriched = await Promise.all(affiliates.map(async (a) => {
            const commissions = await Commission.find({ affiliateId: a._id });
            const totalEarnings = commissions.reduce((s, c) => s + c.amount, 0);
            const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
            const referralCount = await Referral.countDocuments({ affiliateId: a._id });
            return { ...a.toObject(), totalEarnings, paidEarnings, referralCount };
        }));

        return res.json({ data: enriched, page, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error('[AffiliateAdmin.getAll]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/admin/affiliates/:id/status
exports.updateAffiliateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const affiliate = await Affiliate.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
        if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });
        return res.json(affiliate);
    } catch (err) {
        console.error('[AffiliateAdmin.updateStatus]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/admin/affiliates/:id
exports.getAffiliateDetail = async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.params.id).select('-password');
        if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

        const referrals = await Referral.find({ affiliateId: affiliate._id })
            .sort({ createdAt: -1 })
            .populate('referredUserId', 'fullName email');
        const commissions = await Commission.find({ affiliateId: affiliate._id }).sort({ createdAt: -1 });
        const payouts = await Payout.find({ affiliateId: affiliate._id }).sort({ createdAt: -1 });

        return res.json({ affiliate, referrals, commissions, payouts });
    } catch (err) {
        console.error('[AffiliateAdmin.getDetail]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/admin/commissions/:id/status
exports.updateCommissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'paid'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const commission = await Commission.findById(req.params.id);
        if (!commission) return res.status(404).json({ error: 'Commission not found' });
        
        const oldStatus = commission.status;

        if (status === 'paid' && oldStatus !== 'paid') {
            const { method } = req.body;
            if (!method || !['paypal', 'zelle'].includes(method)) {
                return res.status(400).json({ error: 'Valid payout method (paypal or zelle) is required when marking as paid' });
            }
        }

        commission.status = status;
        await commission.save();

        // Record payout if changed to paid
        if (status === 'paid' && oldStatus !== 'paid') {
            const affiliate = await Affiliate.findById(commission.affiliateId);
            const payout = new Payout({
                affiliateId: commission.affiliateId,
                amount: commission.amount,
                method: req.body.method,
                status: 'paid',
                paidAt: new Date(),
                notes: `System generated from commission ${commission._id}`
            });
            await payout.save();
        }

        return res.json(commission);
    } catch (err) {
        console.error('[AffiliateAdmin.updateCommission]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/admin/affiliates/:id/bulk-commissions
exports.bulkUpdateCommissions = async (req, res) => {
    try {
        const { commissionIds, status, method, notes } = req.body;
        if (!Array.isArray(commissionIds) || !status) {
            return res.status(400).json({ error: 'commissionIds (array) and status are required' });
        }

        if (status === 'paid' && (!method || !['paypal', 'zelle'].includes(method))) {
            return res.status(400).json({ error: 'Valid payout method (paypal or zelle) is required when marking as paid' });
        }

        const commissions = await Commission.find({ _id: { $in: commissionIds }, affiliateId: req.params.id });
        if (commissions.length === 0) return res.status(404).json({ error: 'No commissions found' });

        const prevStatuses = commissions.map(c => c.status);
        
        await Commission.updateMany(
            { _id: { $in: commissionIds }, affiliateId: req.params.id },
            { $set: { status } }
        );

        // If marking as paid, create a single consolidated payout record
        if (status === 'paid') {
            const totalAmount = commissions.reduce((sum, c) => sum + (c.status !== 'paid' ? c.amount : 0), 0);
            if (totalAmount > 0) {
                const payout = new Payout({
                    affiliateId: req.params.id,
                    amount: totalAmount,
                    method,
                    status: 'paid',
                    paidAt: new Date(),
                    notes: notes || `Bulk payout for ${commissions.length} commissions`
                });
                await payout.save();
            }
        }

        return res.json({ message: `Updated ${commissions.length} commissions to ${status}` });
    } catch (err) {
        console.error('[AffiliateAdmin.bulkUpdateCommissions]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/admin/affiliates/:id/payouts
exports.createPayout = async (req, res) => {
    try {
        const { amount, method, notes } = req.body;
        if (!amount || !method) {
            return res.status(400).json({ error: 'Amount and method are required' });
        }
        const affiliate = await Affiliate.findById(req.params.id);
        if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

        const payout = new Payout({
            affiliateId: affiliate._id,
            amount,
            method,
            notes: notes || '',
            status: 'pending'
        });
        await payout.save();
        return res.status(201).json(payout);
    } catch (err) {
        console.error('[AffiliateAdmin.createPayout]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/admin/payouts/:id
exports.markPayoutPaid = async (req, res) => {
    try {
        const { method } = req.body;
        const updateData = { status: 'paid', paidAt: new Date() };
        if (method) {
            updateData.method = method;
        }

        const payout = await Payout.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!payout) return res.status(404).json({ error: 'Payout not found' });
        return res.json(payout);
    } catch (err) {
        console.error('[AffiliateAdmin.markPaid]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/admin/payouts
exports.getAllPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find()
            .sort({ createdAt: -1 })
            .populate('affiliateId', 'name email paypalEmail zelleInfo');
        return res.json(payouts);
    } catch (err) {
        console.error('[AffiliateAdmin.getAllPayouts]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/admin/creatives
exports.createCreative = async (req, res) => {
    try {
        const { title, fileUrl, fileType } = req.body;
        if (!title || !fileUrl) {
            return res.status(400).json({ error: 'Title and fileUrl are required' });
        }
        const creative = new Creative({ title, fileUrl, fileType: fileType || 'other' });
        await creative.save();
        return res.status(201).json(creative);
    } catch (err) {
        console.error('[AffiliateAdmin.createCreative]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /api/admin/creatives/:id
exports.deleteCreative = async (req, res) => {
    try {
        const creative = await Creative.findByIdAndDelete(req.params.id);
        if (!creative) return res.status(404).json({ error: 'Creative not found' });
        return res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('[AffiliateAdmin.deleteCreative]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/admin/creatives
exports.getAllCreatives = async (req, res) => {
    try {
        const creatives = await Creative.find().sort({ uploadedAt: -1 });
        return res.json(creatives);
    } catch (err) {
        console.error('[AffiliateAdmin.getCreatives]', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
