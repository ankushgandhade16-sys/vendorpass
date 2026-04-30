const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['vendor', 'wholesaler', 'admin'], required: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  wholesalerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler' },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  blocked: { type: Boolean, default: false },
  blockedReason: { type: String },
  upiPin: { type: String },
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
