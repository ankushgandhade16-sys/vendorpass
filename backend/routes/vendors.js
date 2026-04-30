const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');

// Get vendor by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get all vendors (for wholesaler search)
router.get('/', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update vendor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, businessAddress, businessType } = req.body;
    let vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ msg: 'Vendor profile not found' });

    if (fullName) vendor.fullName = fullName;
    if (email) vendor.email = email;
    if (businessAddress) vendor.businessAddress = businessAddress;
    if (businessType) vendor.businessType = businessType;

    await vendor.save();
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
