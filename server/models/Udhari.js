const mongoose = require('mongoose');

const udhariSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    personName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['gave', 'received'] },
    date: { type: Date, required: true },
    note: { type: String },
    isSettled: { type: Boolean, default: false },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

const Udhari = mongoose.model('Udhari', udhariSchema);
module.exports = Udhari;
