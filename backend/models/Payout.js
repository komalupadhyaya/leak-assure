const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ['paypal', 'zelle'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending',
    },
    notes: {
        type: String,
        default: '',
    },
    paidAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payout', PayoutSchema);
