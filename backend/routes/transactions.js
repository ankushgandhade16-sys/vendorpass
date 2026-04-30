const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get my transactions
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const transactions = await Transaction.find({ wallet: user.wallet }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
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
      const tx = new Transaction({ wallet: userWallet._id, amount, type: 'credit', description });
      await tx.save();
      return res.json({ msg: 'Simulated credit successful', balance: userWallet.balance });
    }

    if (type === 'debit' || type === 'transfer') {
      if (userWallet.balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });
      userWallet.balance -= amount;
      await userWallet.save();
      const tx = new Transaction({ wallet: userWallet._id, amount, type: 'debit', description });
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

      return res.json({ msg: 'Simulated debit/transfer successful', balance: userWallet.balance });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
