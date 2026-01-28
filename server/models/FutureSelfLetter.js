const mongoose = require('mongoose');

const FutureSelfLetterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // YYYY-MM
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One letter per user per month
FutureSelfLetterSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('FutureSelfLetter', FutureSelfLetterSchema);
