const express = require('express');
const router = express.Router();
const CreditRequest = require('../models/CreditRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Request credit (Vendor only)
router.post('/request', auth, async (req, res) => {
  const { wholesalerId, amount } = req.body;
  try {
    const user = await User.findById(req.user.id).populate('vendorProfile');
    if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Only vendors can request credit' });

    const newRequest = new CreditRequest({
      vendor: user.vendorProfile._id,
      wholesaler: wholesalerId,
      amount
    });
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
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
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update request status (Wholesaler only)
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    if (req.user.role !== 'wholesaler') return res.status(403).json({ msg: 'Not authorized' });
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Not found' });
    
    request.status = status;
    request.updatedDate = Date.now();
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
