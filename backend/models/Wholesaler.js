const mongoose = require('mongoose');

const WholesalerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  businessName: { type: String, required: true },
  address: { type: String, required: true },
  productCategories: { type: [String], required: true },
  photos: { type: [String] },
  gst: { type: String }
});

module.exports = mongoose.model('Wholesaler', WholesalerSchema);
