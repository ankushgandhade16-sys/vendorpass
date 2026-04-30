const express = require('express');
const router = express.Router();
const CreditRequest = require('../models/CreditRequest');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Request credit (Vendor only)
router.post('/request', auth, async (req, res) => {
  const { wholesalerId, amount } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('vendorProfile');
    if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Only vendors can request credit' });
    if (user.blocked) return res.status(403).json({ msg: 'Your account is blocked due to unpaid loans.' });

    // Find the wholesaler's user account
    const Wholesaler = require('../models/Wholesaler');
    const wholesaler = await Wholesaler.findById(wholesalerId);

    const newRequest = new CreditRequest({
      vendor: user.vendorProfile._id,
      vendorUser: user._id,
      wholesaler: wholesalerId,
      wholesalerUser: wholesaler ? wholesaler.user : null,
      amount,
      interestRate: 5,
      totalDue: amount * 1.05, // 5% interest
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get my requests
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let requests;
    if (req.user.role === 'vendor') {
      requests = await CreditRequest.find({ vendor: user.vendorProfile }).populate('wholesaler');
    } else if (req.user.role === 'wholesaler') {
      requests = await CreditRequest.find({ wholesaler: user.wholesalerProfile }).populate('vendor');
    }
    res.json(requests || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update request status (Wholesaler approves/rejects)
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    if (req.user.role !== 'wholesaler') return res.status(403).json({ msg: 'Not authorized' });
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Not found' });
    
    if (status === 'Approved') {
      // Disburse loan to vendor's wallet
      const vendorWallet = await Wallet.findOne({ user: request.vendorUser });
      if (vendorWallet) {
        vendorWallet.balance += request.amount;
        await vendorWallet.save();
        await new Transaction({ wallet: vendorWallet._id, amount: request.amount, type: 'credit', description: 'Loan disbursed from wholesaler' }).save();
      }
      request.status = 'Active';
    } else {
      request.status = status;
    }
    
    request.updatedDate = Date.now();
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Repay loan (Vendor)
router.post('/:id/repay', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Loan not found' });
    if (!['Active', 'Overdue', 'Defaulted'].includes(request.status)) {
      return res.status(400).json({ msg: 'This loan is not active' });
    }

    const vendorWallet = await Wallet.findOne({ user: req.user.id });
    if (!vendorWallet || vendorWallet.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // Deduct from vendor
    vendorWallet.balance -= amount;
    await vendorWallet.save();
    await new Transaction({ wallet: vendorWallet._id, amount, type: 'debit', description: 'Loan repayment' }).save();

    // Credit to wholesaler
    if (request.wholesalerUser) {
      const wholesalerWallet = await Wallet.findOne({ user: request.wholesalerUser });
      if (wholesalerWallet) {
        wholesalerWallet.balance += amount;
        await wholesalerWallet.save();
        await new Transaction({ wallet: wholesalerWallet._id, amount, type: 'credit', description: 'Loan repayment received' }).save();
      }
    }

    request.amountPaid += amount;
    const remaining = request.totalDue - request.amountPaid;

    if (remaining <= 0) {
      request.status = 'Paid';
      // Unblock vendor if they were blocked
      const vendorUser = await User.findById(req.user.id);
      if (vendorUser.blocked) {
        vendorUser.blocked = false;
        vendorUser.blockedReason = '';
        await vendorUser.save();
      }
    }

    request.updatedDate = Date.now();
    await request.save();

    res.json({ msg: `Repaid ₹${amount}. Remaining: ₹${Math.max(0, remaining).toFixed(2)}`, loan: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Check overdue loans (called periodically or on dashboard load)
router.post('/check-overdue', auth, async (req, res) => {
  try {
    const now = new Date();
    const activeLoans = await CreditRequest.find({ status: { $in: ['Active', 'Overdue'] } });

    for (const loan of activeLoans) {
      if (now > loan.dueDate) {
        const daysOverdue = Math.ceil((now - loan.dueDate) / (1000 * 60 * 60 * 24));
        
        // Increase interest by 2% for each week overdue
        const extraInterest = Math.floor(daysOverdue / 7) * 2;
        const newRate = loan.interestRate + extraInterest;
        loan.totalDue = loan.amount * (1 + newRate / 100);
        loan.interestRate = newRate;

        if (daysOverdue > 30) {
          // Default after 30 days overdue — block vendor
          loan.status = 'Defaulted';
          const vendorUser = await User.findById(loan.vendorUser);
          if (vendorUser) {
            vendorUser.blocked = true;
            vendorUser.blockedReason = `Loan of ₹${loan.amount} defaulted. Total due: ₹${loan.totalDue.toFixed(2)}`;
            await vendorUser.save();
          }
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
