const mongoose = require('mongoose');

const CreditRequestSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
});

module.exports = mongoose.model('CreditRequest', CreditRequestSchema);
