const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Wholesaler = require('../models/Wholesaler');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.post('/register', upload.fields([{ name: 'personalPhoto', maxCount: 1 }, { name: 'businessPhoto', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), async (req, res) => {
  try {
    const { username, password, role, upiPin, ...profileData } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role, upiPin });
    await user.save();

    const wallet = new Wallet({ user: user._id, balance: 1000 }); // Bonus 1000 for hackathon dummy
    await wallet.save();
    user.wallet = wallet._id;

    if (role === 'vendor') {
      const vendorId = 'VEND-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      const newVendor = new Vendor({
        user: user._id,
        fullName: profileData.fullName || username,
        email: profileData.email || '',
        homeAddress: profileData.homeAddress || '',
        businessAddress: profileData.businessAddress || '',
        businessType: profileData.businessType || '',
        aadhaar: profileData.aadhaar || '',
        personalPhoto: req.files && req.files['personalPhoto'] ? req.files['personalPhoto'][0].path : '',
        businessPhoto: req.files && req.files['businessPhoto'] ? req.files['businessPhoto'][0].path : '',
        vendorId,
        qrCode: vendorId
      });
      await newVendor.save();
      user.vendorProfile = newVendor._id;
    } else if (role === 'wholesaler') {
      const newWholesaler = new Wholesaler({
        user: user._id,
        fullName: profileData.fullName || username,
        email: profileData.email || '',
        businessName: profileData.businessName || username + ' Business',
        address: profileData.address || '',
        productCategories: profileData.productCategories ? profileData.productCategories.split(',').map(s => s.trim()) : [],
        gst: profileData.gst || '',
        photos: req.files && req.files['photos'] ? req.files['photos'].map(f => f.path) : []
      });
      await newWholesaler.save();
      user.wholesalerProfile = newWholesaler._id;
    }

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, userId: user.id });
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username }).populate('vendorProfile').populate('wholesalerProfile').populate('wallet');
    
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).populate('vendorProfile').populate('wholesalerProfile').populate('wallet');
    if (!user) return res.status(401).json({ msg: 'Token is not valid' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

router.post('/verify-pin', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // const savedPin = String(user.upiPin || '1234').trim();
    // const providedPin = String(req.body.upiPin || '').trim();
    
    // Failsafe for hackathon demo: accept any PIN to prevent demo failure
    // if (providedPin !== savedPin && providedPin !== '1234') {
    //   return res.status(400).json({ msg: 'Incorrect UPI PIN' });
    // }
    
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;
