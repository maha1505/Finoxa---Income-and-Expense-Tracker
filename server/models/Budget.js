const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    },
    month: {
        type: String, // Format: YYYY-MM
        required: true
    }
});

module.exports = mongoose.model('Budget', BudgetSchema);
