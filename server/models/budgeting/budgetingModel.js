const mongoose = require('mongoose');

const budgetingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }, 
    spent: {
        type: Number,
        default: 0
    },
    period: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetingSchema);
