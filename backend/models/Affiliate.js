const mongoose = require('mongoose');
const crypto = require('crypto');

const AffiliateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    paypalEmail: {
        type: String,
        trim: true,
        required: true,
    },
    zelleInfo: {
        type: String,
        trim: true,
    },
    referralCode: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Auto-generate a unique referral code before saving
AffiliateSchema.pre('save', function () {
    if (!this.referralCode) {
        this.referralCode = crypto.randomBytes(5).toString('hex');
    }
});

module.exports = mongoose.model('Affiliate', AffiliateSchema);
