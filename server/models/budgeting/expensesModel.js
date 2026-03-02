const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  
  status: {
    type: String,
    enum: ['Completed', 'Pending'],
    default: 'Completed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expensesSchema);
