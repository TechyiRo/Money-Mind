const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    category: { type: String, required: true },
    monthlyLimit: { type: Number, required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
  },
  { timestamps: true }
);

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
