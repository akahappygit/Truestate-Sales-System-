require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Transaction = require('../models/Transaction');

// NUCLEAR FIX: We are putting the link directly here to stop the error
const dbLink = "mongodb+srv://kumarayushanand2001_db_user:RCIFI0v1qgekzFje@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbLink)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

const results = [];
const filePath = path.join(__dirname, '../../truestate_assignment_dataset.csv');

console.log(`\n🚀 Starting Import from: ${filePath}`);

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push({
      TransactionID: data['Transaction ID'],
      Date: new Date(data['Date']),
      CustomerID: data['Customer ID'],
      CustomerName: data['Customer Name'],
      TotalAmount: parseFloat(data['Total Amount']),
      // Add other fields as needed based on your Schema
    });
  })
  .on('end', async () => {
    try {
      console.log(`\nParsing complete! Found ${results.length} records.`);
      console.log('Inserting into database...');
      await Transaction.deleteMany({});
      await Transaction.insertMany(results);
      console.log('✅ SUCCESS! Data uploaded successfully.');
      process.exit();
    } catch (error) {
      console.error('❌ Error inserting data:', error);
      process.exit(1);
    }
  });