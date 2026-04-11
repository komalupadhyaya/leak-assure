const User = require('../models/User');
const Claim = require('../models/Claim');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalActiveMembers = await User.countDocuments({
            subscriptionStatus: 'active',
            role: 'member'
        });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newSignupsThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth },
            role: 'member'
        });

        const activeEssentialPlans = await User.countDocuments({
            subscriptionStatus: 'active',
            plan: 'essential',
            role: 'member'
        });

        const activePremiumPlans = await User.countDocuments({
            subscriptionStatus: 'active',
            plan: 'premium',
            role: 'member'
        });

        const openClaims = await Claim.countDocuments({
            status: { $in: ['New', 'Under Review', 'Approved', 'Scheduled'] }
        });

        const claimsSubmittedThisMonth = await Claim.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        const failedCancelledSubscriptions = await User.countDocuments({
            subscriptionStatus: 'canceled',
            role: 'member'
        });

        const monthlyRecurringRevenueResult = await User.aggregate([
            { $match: { subscriptionStatus: 'active', role: 'member' } },
            { $group: { _id: null, totalMRR: { $sum: '$planPrice' } } }
        ]);

        const monthlyRecurringRevenue = monthlyRecurringRevenueResult.length > 0
            ? monthlyRecurringRevenueResult[0].totalMRR
            : 0;

        res.json({
            totalActiveMembers,
            newSignupsThisMonth,
            activeEssentialPlans,
            activePremiumPlans,
            openClaims,
            claimsSubmittedThisMonth,
            failedCancelledSubscriptions,
            monthlyRecurringRevenue,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new admin user
exports.createAdminUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'fullName, email, and password are required.' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'A user with this email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            fullName,
            email,
            password: hashedPassword,
            role: 'admin',
            subscriptionStatus: 'active',
        });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin user created successfully.', user: { id: newAdmin._id, email: newAdmin.email, fullName: newAdmin.fullName } });
    } catch (error) {
        console.error('Create admin user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset a member's password (admin action)
exports.resetMemberPassword = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        const user = await User.findById(memberId);
        if (!user) {
            return res.status(404).json({ error: 'Member not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.forcePasswordChange = true;
        await user.save();

        res.json({ message: `Password for ${user.email} has been reset. They will be prompted to change it on next login.` });
    } catch (error) {
        console.error('Reset member password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
