const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for system actions or unauthenticated signups
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String,
        required: true // e.g., 'Claim', 'User', 'Subscription'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
