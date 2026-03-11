const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberName: {
        type: String,
        required: true
    },
    serviceAddress: {
        type: String,
        required: true
    },
    issueType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'Under Review', 'Approved', 'Denied', 'Scheduled', 'Completed', 'Closed'],
        default: 'New'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    assignedVendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    photos: [{
        type: String
    }],
    notes: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Claim', ClaimSchema);
