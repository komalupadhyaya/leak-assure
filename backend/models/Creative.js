const mongoose = require('mongoose');

const CreativeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['banner', 'link', 'other'],
        default: 'other',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Creative', CreativeSchema);
