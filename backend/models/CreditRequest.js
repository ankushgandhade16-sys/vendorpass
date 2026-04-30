const mongoose = require('mongoose');

const CreditRequestSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler', required: true },
  wholesalerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  totalDue: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 5 },
  dueDate: { type: Date },
  approvedDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Overdue', 'Paid', 'Defaulted'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  updatedDate: { type: Date }
});

module.exports = mongoose.model('CreditRequest', CreditRequestSchema);
