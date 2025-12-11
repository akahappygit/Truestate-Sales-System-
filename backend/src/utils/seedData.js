require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kumarayushanand2003:Ayush2003@cluster0.ofklt18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  });

const results = [];
const filePath = path.join(__dirname, '../../truestate_assignment_dataset.csv');

console.log(`\n🚀 Starting Import from: ${filePath}`);

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push({
      TransactionID: data['Transaction ID'] || '',
      Date: new Date(data['Date']),
      CustomerID: data['Customer ID'] || '',
      CustomerName: data['Customer Name'] || '',
      PhoneNumber: data['Phone Number'] || '',
      Gender: data['Gender'] || '',
      Age: data['Age'] ? parseInt(data['Age']) : null,
      CustomerRegion: data['Customer Region'] || '',
      CustomerType: data['Customer Type'] || '',
      ProductID: data['Product ID'] || '',
      ProductName: data['Product Name'] || '',
      Brand: data['Brand'] || '',
      ProductCategory: data['Product Category'] || '',
      Tags: data['Tags'] ? data['Tags'].split(',').map(t => t.trim()) : [],
      Quantity: data['Quantity'] ? parseInt(data['Quantity']) : 0,
      PricePerUnit: data['Price per Unit'] ? parseFloat(data['Price per Unit']) : null,
      DiscountPercentage: data['Discount Percentage'] ? parseFloat(data['Discount Percentage']) : null,
      TotalAmount: data['Total Amount'] ? parseFloat(data['Total Amount']) : 0,
      FinalAmount: data['Final Amount'] ? parseFloat(data['Final Amount']) : null,
      PaymentMethod: data['Payment Method'] || '',
      OrderStatus: data['Order Status'] || '',
      DeliveryType: data['Delivery Type'] || '',
      StoreID: data['Store ID'] || '',
      StoreLocation: data['Store Location'] || '',
      SalespersonID: data['Salesperson ID'] || '',
      EmployeeName: data['Employee Name'] || '',
    });
  })
  .on('end', async () => {
    try {
      console.log(`\nParsing complete! Found ${results.length} records.`);
      console.log('Clearing existing data...');
      await Transaction.deleteMany({});
      console.log('Inserting new data into database...');
      await Transaction.insertMany(results);
      console.log('✅ SUCCESS! Data imported successfully.');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error inserting data:', error.message);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      process.exit(1);
    }
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV file:', error);
    process.exit(1);
  });
