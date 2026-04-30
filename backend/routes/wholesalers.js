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

module.exports = router;
