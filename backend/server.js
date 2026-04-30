const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/wholesalers', require('./routes/wholesalers'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/credit', require('./routes/credit'));
app.use('/api/messages', require('./routes/messages'));

// Connect to MongoDB using mongodb-memory-server
const { MongoMemoryServer } = require('mongodb-memory-server');

const startDB = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  mongoose.connect(uri).then(() => {
    console.log(`MongoDB Connected (In-Memory) at ${uri}`);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
};

startDB();
