const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stripePaymentIntentId: String,
    stripeInvoiceId: String,
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'usd',
    },
    status: {
        type: String,
        enum: ['succeeded', 'pending', 'failed', 'refunded'],
        default: 'pending',
    },
    planType: String,
    billingReason: String, // e.g., subscription_create, subscription_cycle
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', PaymentSchema);
