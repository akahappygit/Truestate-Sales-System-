const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

// YOUR DATABASE LINK (Hardcoded to prevent errors)
const dbLink = "mongodb+srv://kumarayushanand2001_db_user:RCIFI0v1qgekzFje@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// CONNECT
mongoose.connect(dbLink)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// TRANSACTION SCHEMA
const transactionSchema = new mongoose.Schema({
  TransactionID: String,
  Date: Date,
  CustomerID: String,
  CustomerName: String,
  TotalAmount: Number,
  // (MongoDB allows flexible schemas, so we can stick to basics for the test)
}, { strict: false });

const Transaction = mongoose.model('Transaction', transactionSchema);

// READ AND UPLOAD
const results = [];
const filePath = path.join(__dirname, 'truestate_assignment_dataset.csv'); 

console.log(`\n🚀 Reading file: ${filePath}`);

if (!fs.existsSync(filePath)) {
    console.error("❌ ERROR: Could not find the CSV file!");
    console.error("Please make sure 'truestate_assignment_dataset.csv' is inside the 'backend' folder.");
    process.exit(1);
}

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    try {
      console.log(`\nParsing complete! Found ${results.length} records.`);
      console.log('Inserting into database... (Wait 10 seconds)');
      
      await Transaction.deleteMany({}); // Clean start
      await Transaction.insertMany(results);
      
      console.log('✅ SUCCESS! Data uploaded successfully.');
      process.exit();
    } catch (error) {
      console.error('❌ Upload Failed:', error);
      process.exit(1);
    }
  });