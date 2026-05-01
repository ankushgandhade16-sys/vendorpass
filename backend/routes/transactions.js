const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateTrustScore } = require('../utils/trustScore');

// Get my transactions
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.wallet) return res.json([]);
    const transactions = await Transaction.find({ wallet: user.wallet }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Mock transaction (Add / Deduct / Transfer)
router.post('/simulate', auth, async (req, res) => {
  const { amount, type, description, toUsername } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('wallet');
    let userWallet = await Wallet.findById(user.wallet._id);

    if (type === 'credit') {
      userWallet.balance += amount;
      await userWallet.save();
      const tx = new Transaction({ wallet: userWallet._id, amount, type: 'credit', description: `Top-up by ${user.username}` });
      await tx.save();
      // Trust score +5 for vendor transactions
      if (user.vendorProfile) await updateTrustScore(user.vendorProfile, 5);
      return res.json({ msg: 'Simulated credit successful', balance: userWallet.balance });
    }

    if (type === 'debit' || type === 'transfer') {
      if (userWallet.balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });
      userWallet.balance -= amount;
      await userWallet.save();
      const tx = new Transaction({ wallet: userWallet._id, amount, type: 'debit', description: `Withdrawal by ${user.username}` });
      await tx.save();

      if (type === 'transfer' && toUsername) {
        const receiver = await User.findOne({ username: toUsername }).populate('wallet');
        if (receiver) {
          const receiverWallet = await Wallet.findById(receiver.wallet._id);
          receiverWallet.balance += amount;
          await receiverWallet.save();
          const rTx = new Transaction({ wallet: receiverWallet._id, amount, type: 'credit', description: `Received from ${user.username}` });
          await rTx.save();
        }
      }

      // Trust score +5 for vendor transactions
      if (user.vendorProfile) await updateTrustScore(user.vendorProfile, 5);
      return res.json({ msg: 'Simulated debit/transfer successful', balance: userWallet.balance });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Public payment route (No auth required for demo)
router.post('/pay/:vendorId', async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ msg: 'Invalid amount' });
  }
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ vendorId: req.params.vendorId });
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });

    let vendorWallet = await Wallet.findOne({ user: vendor.user });
    if (!vendorWallet) return res.status(404).json({ msg: 'Vendor wallet not found' });

    vendorWallet.balance += Number(amount);
    await vendorWallet.save();

    const tx = new Transaction({ 
      wallet: vendorWallet._id, 
      amount: Number(amount), 
      type: 'credit', 
      description: 'Customer Payment (QR)' 
    });
    await tx.save();

    res.json({ msg: 'Payment successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
