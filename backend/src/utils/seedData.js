/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction');

dotenv.config();

const csvPath = path.join(__dirname, '..', '..', 'truestate_assignment_dataset.csv');

async function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const record = {
            transactionId: row['Transaction ID'],
            date: row.Date ? new Date(row.Date) : null,
            customerId: row['Customer ID'],
            customerName: row['Customer Name'],
            phoneNumber: row['Phone Number'],
            gender: row.Gender,
            age: row.Age ? Number(row.Age) : null,
            customerRegion: row['Customer Region'],
            customerType: row['Customer Type'],
            productId: row['Product ID'],
            productName: row['Product Name'],
            brand: row.Brand,
            productCategory: row['Product Category'],
            tags: row.Tags
              ? row.Tags.split(',').map((tag) => tag.trim()).filter(Boolean)
              : [],
            quantity: row.Quantity ? Number(row.Quantity) : null,
            pricePerUnit: row['Price per Unit'] ? Number(row['Price per Unit']) : null,
            discountPercentage: row['Discount Percentage']
              ? Number(row['Discount Percentage'])
              : null,
            totalAmount: row['Total Amount'] ? Number(row['Total Amount']) : null,
            finalAmount: row['Final Amount'] ? Number(row['Final Amount']) : null,
            paymentMethod: row['Payment Method'],
            orderStatus: row['Order Status'],
            deliveryType: row['Delivery Type'],
            storeId: row['Store ID'],
            storeLocation: row['Store Location'],
            salespersonId: row['Salesperson ID'],
            employeeName: row['Employee Name'],
          };

          rows.push(record);
        } catch (err) {
          reject(err);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const data = await parseCsv(csvPath);

  await Transaction.deleteMany({});
  await Transaction.insertMany(data);

  console.log('✅ SUCCESS! Data Imported');
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

