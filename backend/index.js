require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import Routes
const transactionRoutes = require('./src/routes/transactions'); 

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kumarayushanand2003:Ayush2003@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// --- FIX 1: Allow ALL origins explicitly ---
app.use(cors({ origin: "*" })); 
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running!' });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');
    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Connection Error:', err);
  }
}

start();