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
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.post('/register', upload.fields([{ name: 'personalPhoto', maxCount: 1 }, { name: 'businessPhoto', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), async (req, res) => {
  try {
    const { username, password, role, ...profileData } = req.body;
    
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role });
    await user.save();

    const wallet = new Wallet({ user: user._id, balance: 1000 }); // Bonus 1000 for hackathon dummy
    await wallet.save();
    user.wallet = wallet._id;

    if (role === 'vendor') {
      const vendorId = 'VEND-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      const newVendor = new Vendor({
        user: user._id,
        fullName: profileData.fullName,
        email: profileData.email,
        homeAddress: profileData.homeAddress,
        businessAddress: profileData.businessAddress,
        businessType: profileData.businessType,
        aadhaar: profileData.aadhaar,
        personalPhoto: req.files['personalPhoto'] ? req.files['personalPhoto'][0].path : '',
        businessPhoto: req.files['businessPhoto'] ? req.files['businessPhoto'][0].path : '',
        vendorId,
        qrCode: vendorId
      });
      await newVendor.save();
      user.vendorProfile = newVendor._id;
    } else if (role === 'wholesaler') {
      const newWholesaler = new Wholesaler({
        user: user._id,
        fullName: profileData.fullName,
        email: profileData.email,
        businessName: profileData.businessName,
        address: profileData.address,
        productCategories: profileData.productCategories ? profileData.productCategories.split(',') : [],
        gst: profileData.gst,
        photos: req.files['photos'] ? req.files['photos'].map(f => f.path) : []
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
    console.error(err);
    res.status(500).send('Server error');
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
    res.status(500).send('Server error');
  }
});

router.get('/me', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).populate('vendorProfile').populate('wholesalerProfile').populate('wallet');
    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;
