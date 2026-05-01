const express = require('express');
const router = express.Router();
const Wholesaler = require('../models/Wholesaler');
const auth = require('../middleware/auth');

// Get wholesaler by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const wholesaler = await Wholesaler.findById(req.params.id);
    if (!wholesaler) return res.status(404).json({ msg: 'Wholesaler not found' });
    res.json(wholesaler);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get all wholesalers (for vendor search)
router.get('/', auth, async (req, res) => {
  try {
    const wholesalers = await Wholesaler.find();
    res.json(wholesalers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update wholesaler profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id).populate('wholesalerProfile');
    if (!user || req.user.role !== 'wholesaler') return res.status(403).json({ msg: 'Not authorized' });

    const { fullName, businessName, email, address, gst, productCategories } = req.body;
    const wholesaler = user.wholesalerProfile;
    
    if (fullName) wholesaler.fullName = fullName;
    if (businessName) wholesaler.businessName = businessName;
    if (email) wholesaler.email = email;
    if (address) wholesaler.address = address;
    if (gst) wholesaler.gst = gst;
    if (productCategories) wholesaler.productCategories = typeof productCategories === 'string' ? productCategories.split(',').map(s => s.trim()) : productCategories;

    await wholesaler.save();
    res.json(wholesaler);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
