const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: true,
    },
    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 5, // Default $5 commission per conversion
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Commission', CommissionSchema);
