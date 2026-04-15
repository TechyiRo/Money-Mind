const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.isGoogleUser; } },
    googleId: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    avatar: { type: String },
    monthlyIncome: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'system' },
    customCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
