const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const memberController = require('../controllers/member.controller');
const adminController = require('../controllers/admin.controller');

const MONGO_URI = process.env.MONGO_URI;

async function runVerification() {
    if (!MONGO_URI) {
        console.error('MONGO_URI not found');
        process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log('--- STARTING ADMIN ISOLATION VERIFICATION ---');

    // 1. Check Admin Account Fields
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
        console.log(`[CHECK 1] Admin Found: ${admin.email}`);
        const hasSubscriptionData = !!(admin.plan || admin.subscriptionStatus || admin.stripeCustomerId || admin.stripeSubscriptionId);
        if (!hasSubscriptionData) {
            console.log('✅ PASS: Admin has no subscription data.');
        } else {
            console.log('❌ FAIL: Admin still has subscription data:', {
                plan: admin.plan,
                status: admin.subscriptionStatus,
                stripeId: admin.stripeCustomerId
            });
        }
    } else {
        console.log('⚠️ WARNING: No admin account found to check.');
    }

    // 2. Check Member List Filtering
    const mockRes = () => {
        const res = {};
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => { res.data = data; return res; };
        return res;
    };

    const res1 = mockRes();
    await memberController.getAllMembers({ query: {} }, res1);
    const members = res1.data.data;
    const adminInList = members.some(m => m.role === 'admin');
    if (!adminInList) {
        console.log('✅ PASS: Admin excluded from Members list.');
    } else {
        console.log('❌ FAIL: Admin found in Members list.');
    }

    // 3. Check Dashboard Stats
    const res2 = mockRes();
    await adminController.getDashboardStats({}, res2);
    const stats = res2.data;
    const actualActiveMembers = await User.countDocuments({ role: 'member', subscriptionStatus: 'active' });

    if (stats.totalActiveMembers === actualActiveMembers) {
        console.log(`✅ PASS: Stats match member-only count (${stats.totalActiveMembers}).`);
    } else {
        console.log(`❌ FAIL: Stats mismatch. Stats: ${stats.totalActiveMembers}, DB Members: ${actualActiveMembers}`);
    }

    // 4. Test User Model Required Fields for Admin
    try {
        const adminTest = new User({
            fullName: 'Test Admin Isolation',
            email: 'isolation_test@example.com',
            password: 'password123',
            role: 'admin'
        });
        await adminTest.save();
        console.log('✅ PASS: New Admin created without phone/address/plan.');
        await User.deleteOne({ _id: adminTest._id });
    } catch (err) {
        console.log('❌ FAIL: Could not create admin without required member fields:', err.message);
    }

    console.log('--- VERIFICATION COMPLETE ---');
    mongoose.connection.close();
}

runVerification().catch(err => {
    console.error(err);
    process.exit(1);
});
