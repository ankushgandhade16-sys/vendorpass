const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get conversations list (unique users I've chatted with)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const seen = new Set();
    const convos = [];
    for (const msg of messages) {
      const otherId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        const otherUser = await User.findById(otherId).populate('vendorProfile').populate('wholesalerProfile');
        const name = otherUser.vendorProfile?.fullName || otherUser.wholesalerProfile?.fullName || otherUser.username;
        const photo = otherUser.vendorProfile?.personalPhoto || (otherUser.wholesalerProfile?.photos && otherUser.wholesalerProfile.photos[0]) || '';
        convos.push({ userId: otherId, name, role: otherUser.role, photo, lastMessage: msg.text || `₹${msg.amount} sent`, lastDate: msg.createdAt });
      }
    }
    res.json(convos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Send a text message
router.post('/send', auth, async (req, res) => {
  const { receiverId, text } = req.body;
  try {
    const msg = new Message({ sender: req.user.id, receiver: receiverId, text, type: 'text' });
    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Send money via chat
router.post('/send-money', auth, async (req, res) => {
  const { receiverId, amount, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ msg: 'Invalid amount' });

  try {
    // Check if sender is blocked
    const senderUser = await User.findById(req.user.id);
    if (senderUser.blocked) return res.status(403).json({ msg: 'Your account is blocked due to unpaid loans. Please repay your loan first.' });

    const senderWallet = await Wallet.findOne({ user: req.user.id });
    if (!senderWallet || senderWallet.balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

    const receiverWallet = await Wallet.findOne({ user: receiverId });
    if (!receiverWallet) return res.status(404).json({ msg: 'Receiver wallet not found' });

    const receiverUser = await User.findById(receiverId);

    // Transfer
    senderWallet.balance -= amount;
    await senderWallet.save();
    receiverWallet.balance += amount;
    await receiverWallet.save();

    // Transaction records
    await new Transaction({ wallet: senderWallet._id, amount, type: 'debit', description: `Sent to ${receiverUser.username}: ${note || 'Chat payment'}` }).save();
    await new Transaction({ wallet: receiverWallet._id, amount, type: 'credit', description: `Received from ${senderUser.username}: ${note || 'Chat payment'}` }).save();

    // Message record
    const msg = new Message({ sender: req.user.id, receiver: receiverId, text: note || 'Payment', amount, type: 'payment' });
    await msg.save();

    res.json({ msg: 'Payment sent!', balance: senderWallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
