// Fix MongoDB SRV DNS resolution on Windows (querySrv ENOTFOUND) — must run first
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

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

// Use MONGO_URI_DIRECT (from Atlas "Direct connection") if SRV fails with ENOTFOUND on Windows
const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI || 'mongodb+srv://kumarayushanand2003:Ayush2003@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// --- FIX 1: Allow ALL origins explicitly ---
app.use(cors({ origin: "*" })); 
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running!' });
});

app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const connected = dbState === 1;
  res.json({
    ok: true,
    backend: 'reachable',
    database: connected ? 'connected' : 'disconnected',
  });
});

function connectDb() {
  return mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    keepAlive: true,
    maxPoolSize: 10,
  });
}

async function start() {
  try {
    await connectDb();
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Server starting without database. Transaction routes will fail until MongoDB is reachable.');
  }

  // Keep MongoDB connected: reconnect automatically on disconnect
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected. Reconnecting in 3s...');
    setTimeout(() => {
      connectDb().then(() => console.log('✅ MongoDB Reconnected')).catch((e) => console.error('Reconnect failed:', e.message));
    }, 3000);
  });
  mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message));

  // Always start the server so the backend is reachable (e.g. GET /)
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

start();