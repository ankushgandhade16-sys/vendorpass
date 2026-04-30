const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  homeAddress: { type: String, required: true },
  businessAddress: { type: String, required: true },
  businessType: { type: String, required: true },
  aadhaar: { type: String, required: true },
  personalPhoto: { type: String },
  businessPhoto: { type: String },
  vendorId: { type: String, unique: true },
  qrCode: { type: String },
  trustScore: { type: Number, default: 0 },
  trustTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
});

module.exports = mongoose.model('Vendor', VendorSchema);
