const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    serviceAddress: {
        type: String,
        required: true,
        trim: true,
    },
    plan: {
        type: String,
        required: true,
        enum: ['essential', 'premium'],
    },
    smsOptIn: {
        type: Boolean,
        default: false,
    },
    stripeCustomerId: {
        type: String,
    },
    stripeSessionId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
    },
    subscriptionStatus: {
        type: String,
        enum: ['pending', 'active', 'canceled'],
        default: 'active',
    },
    planPrice: {
        type: Number,
    },
    activatedAt: {
        type: Date,
    },
    password: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    forcePasswordChange: {
        type: Boolean,
        default: true,
    },
    waitingPeriodEnd: {
        type: Date,
    },
    paymentGraceUntil: {
        type: Date,
    },
    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member',
    },
    lastPaymentDate: {
        type: Date,
    },
    confirmationEmailSent: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
