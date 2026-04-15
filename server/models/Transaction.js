const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    amount: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    description: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
