const Claim = require('../models/Claim');

const AuditLog = require('../models/AuditLog');

exports.createClaim = async (req, res) => {
    try {
        const photos = req.files ? req.files.map(f => f.path) : [];
        const claimData = { ...req.body, photos };

        const claim = new Claim(claimData);
        await claim.save();

        await AuditLog.create({
            userId: req.user?.id || claim.memberId,
            action: 'CREATE_CLAIM',
            targetType: 'Claim',
            targetId: claim._id
        });

        // Notify member
        const User = require('../models/User');
        const user = await User.findById(claim.memberId);
        if (user) {
            const emailService = require('../services/email.service');
            emailService.sendClaimConfirmation(user.email, user.fullName, claim.issueType);
        }

        res.status(201).json(claim);
    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllClaims = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const claims = await Claim.find()
            .populate('assignedVendorId', 'name company phone email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRecords = await Claim.countDocuments();
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            data: claims,
            page,
            totalPages,
            totalRecords
        });
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getClaimById = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id).populate('assignedVendorId', 'name company phone email');
        if (!claim) return res.status(404).json({ error: 'Claim not found' });
        res.json(claim);
    } catch (error) {
        console.error('Error fetching claim:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!claim) return res.status(404).json({ error: 'Claim not found' });

        await AuditLog.create({
            userId: req.user?.id,
            action: 'UPDATE_CLAIM_STATUS',
            targetType: 'Claim',
            targetId: claim._id,
            metadata: { status }
        });

        // Notify member
        const User = require('../models/User');
        const user = await User.findById(claim.memberId);
        if (user) {
            const emailService = require('../services/email.service');
            const smsService = require('../services/sms.service');
            emailService.sendClaimStatusUpdate(user.email, user.fullName, status);
            smsService.sendClaimStatusUpdateSMS(user.phone, status);
        }

        res.json(claim);
    } catch (error) {
        console.error('Error updating claim status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.assignVendor = async (req, res) => {
    try {
        const { vendorId } = req.body;
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { assignedVendorId: vendorId || null },
            { new: true }
        ).populate('assignedVendorId', 'name company');

        if (!claim) return res.status(404).json({ error: 'Claim not found' });

        await AuditLog.create({
            userId: req.user?.id,
            action: 'ASSIGN_VENDOR',
            targetType: 'Claim',
            targetId: claim._id,
            metadata: { vendorId }
        });

        // Notify member about scheduling if a professional is assigned
        const User = require('../models/User');
        const user = await User.findById(claim.memberId);
        if (user && claim.assignedVendorId) {
            const smsService = require('../services/sms.service');
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 1); // Mock scheduling for tomorrow
            smsService.sendServiceScheduledSMS(
                user.phone,
                scheduledDate.toLocaleDateString(),
                claim.assignedVendorId.name
            );
        }

        res.json(claim);
    } catch (error) {
        console.error('Error assigning vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.addNote = async (req, res) => {
    try {
        const { note } = req.body;
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { $push: { notes: note } },
            { new: true }
        );
        if (!claim) return res.status(404).json({ error: 'Claim not found' });
        res.json(claim);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getClaimsByMember = async (req, res) => {
    try {
        const claims = await Claim.find({ memberId: req.params.memberId }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error('Error fetching member claims:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

