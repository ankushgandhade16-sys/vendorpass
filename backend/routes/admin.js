const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Block/Unblock user
router.post('/block/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ msg: 'User not found' });

    targetUser.blocked = !targetUser.blocked;
    await targetUser.save();

    res.json({ msg: targetUser.blocked ? 'User blocked' : 'User unblocked', blocked: targetUser.blocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get admin profile (useful for chatting)
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('-password');
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get all users with profiles
router.get('/users', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

    const users = await User.find({ role: { $ne: 'admin' } })
      .populate('vendorProfile')
      .populate('wholesalerProfile')
      .select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
