const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    targetDate: { type: Date, required: true },
    emoji: { type: String, default: '🎯' },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
