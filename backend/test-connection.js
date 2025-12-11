require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kumarayushanand2003:Ayush2003@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log('Testing MongoDB connection...');
console.log('MONGO_URI:', MONGO_URI ? 'Set' : 'Not set');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', err.message);
    console.error('\n💡 Common fixes:');
    console.error('1. Check if MONGO_URI in .env is correct');
    console.error('2. Check if MongoDB cluster allows your IP address');
    console.error('3. Check if username/password are correct');
    process.exit(1);
  });

