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
    referralSlug: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    commissionType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'percentage',
    },
    commissionValue: {
        type: Number,
        default: 20, // 20% by default
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

// Static helper: generate a unique slug for a given name
AffiliateSchema.statics.generateUniqueSlug = async function (name) {
    let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (!slug) return null;

    let existing = await this.findOne({ referralSlug: slug });
    let counter = 1;
    const originalSlug = slug;

    while (existing) {
        slug = `${originalSlug}-${counter}`;
        existing = await this.findOne({ referralSlug: slug });
        counter++;
    }

    return slug;
};

module.exports = mongoose.model('Affiliate', AffiliateSchema);
