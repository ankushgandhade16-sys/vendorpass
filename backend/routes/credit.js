const express = require('express');
const router = express.Router();
const CreditRequest = require('../models/CreditRequest');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { updateTrustScore } = require('../utils/trustScore');

// Request credit (Vendor only)
router.post('/request', auth, async (req, res) => {
  const { wholesalerId, amount } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('vendorProfile');
    if (!user) return res.status(401).json({ msg: 'User not found' });
    if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Only vendors can request credit' });
    if (user.blocked) return res.status(403).json({ msg: 'Your account is blocked due to unpaid loans.' });

    const Wholesaler = require('../models/Wholesaler');
    const wholesaler = await Wholesaler.findById(wholesalerId);

    const newRequest = new CreditRequest({
      vendor: user.vendorProfile._id,
      vendorUser: user._id,
      wholesaler: wholesalerId,
      wholesalerUser: wholesaler ? wholesaler.user : null,
      amount,
      status: 'Pending'
    });
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get my requests
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });
    let requests;
    if (req.user.role === 'vendor') {
      requests = await CreditRequest.find({ vendor: user.vendorProfile }).populate('wholesaler');
    } else if (req.user.role === 'wholesaler') {
      requests = await CreditRequest.find({ wholesaler: user.wholesalerProfile }).populate('vendor');
    }
    res.json(requests || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Wholesaler approves with interest rate and duration (in minutes)
router.put('/:id', auth, async (req, res) => {
  const { status, interestRate, durationMinutes } = req.body;
  try {
    if (req.user.role !== 'wholesaler') return res.status(403).json({ msg: 'Not authorized' });
    const request = await CreditRequest.findById(req.params.id).populate('vendorUser wholesalerUser');
    if (!request) return res.status(404).json({ msg: 'Not found' });
    
    if (status === 'Approved') {
      const rate = interestRate || 5;
      const mins = durationMinutes || 5;
      
      request.baseInterestRate = rate;
      request.interestRate = rate;
      request.totalDue = request.amount * (1 + rate / 100);
      request.durationMinutes = mins;
      request.dueDate = new Date(Date.now() + mins * 60 * 1000);
      request.status = 'Active';
      request.approvedDate = Date.now();

      const vendorName = request.vendorUser ? request.vendorUser.username : 'Vendor';
      const wholesalerName = request.wholesalerUser ? request.wholesalerUser.username : 'Wholesaler';

      // Disburse loan — deduct from wholesaler, credit to vendor
      const wholesalerWallet = await Wallet.findOne({ user: request.wholesalerUser });
      if (wholesalerWallet) {
        if (wholesalerWallet.balance < request.amount) {
          return res.status(400).json({ msg: 'Insufficient balance to disburse loan' });
        }
        wholesalerWallet.balance -= request.amount;
        await wholesalerWallet.save();
        await new Transaction({ wallet: wholesalerWallet._id, amount: request.amount, type: 'debit', description: `Loan disbursed to ${vendorName}` }).save();
      }

      const vendorWallet = await Wallet.findOne({ user: request.vendorUser });
      if (vendorWallet) {
        vendorWallet.balance += request.amount;
        await vendorWallet.save();
        await new Transaction({ wallet: vendorWallet._id, amount: request.amount, type: 'credit', description: `Loan received from ${wholesalerName}` }).save();
      }
    } else {
      request.status = status;
    }
    
    request.updatedDate = Date.now();
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Repay loan (Vendor)
router.post('/:id/repay', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const request = await CreditRequest.findById(req.params.id).populate('vendorUser wholesalerUser');
    if (!request) return res.status(404).json({ msg: 'Loan not found' });
    if (!['Active', 'Overdue', 'Defaulted'].includes(request.status)) {
      return res.status(400).json({ msg: 'This loan is not active' });
    }

    const vendorName = request.vendorUser ? request.vendorUser.username : 'Vendor';
    const wholesalerName = request.wholesalerUser ? request.wholesalerUser.username : 'Wholesaler';

    const vendorWallet = await Wallet.findOne({ user: req.user.id });
    if (!vendorWallet || vendorWallet.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // Deduct from vendor
    vendorWallet.balance -= amount;
    await vendorWallet.save();
    await new Transaction({ wallet: vendorWallet._id, amount, type: 'debit', description: `Loan repayment to ${wholesalerName}` }).save();

    // Credit to wholesaler
    if (request.wholesalerUser) {
      const wholesalerWallet = await Wallet.findOne({ user: request.wholesalerUser });
      if (wholesalerWallet) {
        wholesalerWallet.balance += amount;
        await wholesalerWallet.save();
        await new Transaction({ wallet: wholesalerWallet._id, amount, type: 'credit', description: `Loan repayment from ${vendorName}` }).save();
      }
    }

    request.amountPaid = parseFloat((request.amountPaid + amount).toFixed(2));
    const remaining = parseFloat((request.totalDue - request.amountPaid).toFixed(2));

    if (remaining <= 0.01) {  // tolerance for floating point
      request.status = 'Paid';
      request.amountPaid = request.totalDue; // ensure exact match
      // Unblock vendor
      const vendorUser = await User.findById(req.user.id);
      if (vendorUser) {
        vendorUser.blocked = false;
        vendorUser.blockedReason = '';
        await vendorUser.save();
      }
      // Trust score: +20 if paid before due, +10 if paid after due
      const paidBeforeDue = request.dueDate && new Date() <= new Date(request.dueDate);
      await updateTrustScore(request.vendor, paidBeforeDue ? 20 : 10);
    }

    request.updatedDate = Date.now();
    await request.save();

    res.json({ msg: `Repaid ₹${amount}. Remaining: ₹${Math.max(0, remaining).toFixed(2)}`, loan: request, status: request.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Check overdue loans (uses MINUTES for hackathon demo)
router.post('/check-overdue', auth, async (req, res) => {
  try {
    const now = new Date();
    const activeLoans = await CreditRequest.find({ status: { $in: ['Active', 'Overdue'] } });

    for (const loan of activeLoans) {
      if (loan.dueDate && now > loan.dueDate) {
        const minutesOverdue = Math.ceil((now - loan.dueDate) / (1000 * 60));
        
        // Increase interest by 2% for every 2 minutes overdue (fast for demo)
        const extraInterest = Math.floor(minutesOverdue / 2) * 2;
        const baseRate = loan.baseInterestRate || 5;
        const newRate = baseRate + extraInterest;
        
        // Only update if the rate actually changed
        if (newRate !== loan.interestRate) {
          loan.interestRate = newRate;
          loan.totalDue = loan.amount * (1 + newRate / 100);
        }

        if (minutesOverdue > 10) {
          // Default after 10 minutes overdue — block vendor
          loan.status = 'Defaulted';
          const vendorUser = await User.findById(loan.vendorUser);
          if (vendorUser && !vendorUser.blocked) {
            vendorUser.blocked = true;
            vendorUser.blockedReason = `Loan of ₹${loan.amount} defaulted. Total due: ₹${loan.totalDue.toFixed(2)}. Pay to unblock.`;
            await vendorUser.save();
          }
          // Trust score: -30 for defaulting
          await updateTrustScore(loan.vendor, -30);
        } else {
          loan.status = 'Overdue';
        }
        await loan.save();
      }
    }

    res.json({ msg: 'Overdue check complete' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
