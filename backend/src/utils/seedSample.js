/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Furniture', 'Electronics', 'Apparel', 'Home & Kitchen', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Office Supplies'];
const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'EMI', 'Net Banking', 'Wallet', 'COD'];
const TAGS_POOL = ['premium', 'sale', 'new', 'bestseller', 'living-room', 'office', 'traditional', 'wireless', 'organic', 'gift', 'bulk', 'express'];
const CUSTOMER_TYPES = ['New', 'Regular', 'Premium', 'Corporate'];
const ORDER_STATUSES = ['Delivered', 'Shipped', 'Processing', 'Pending'];
const DELIVERY_TYPES = ['Standard', 'Express', 'Same-day'];
const BRANDS = ['HomeStyle', 'ErgoSeat', 'TechView', 'SoundMax', 'SilkLine', 'SportPro', 'ReadWell', 'PlayBox', 'GlowCare', 'AutoParts', 'OfficePlus'];

const FIRST_NAMES = [
  'Priya', 'Amit', 'Sneha', 'Rajesh', 'Kavita', 'Vikram', 'Anita', 'Suresh', 'Pooja', 'Rahul',
  'Neha', 'Arun', 'Divya', 'Kiran', 'Meera', 'Sanjay', 'Lakshmi', 'Ravi', 'Swati', 'Manish',
  'Preeti', 'Deepak', 'Shweta', 'Naveen', 'Kirti', 'Ajay', 'Rekha', 'Vijay', 'Sunita', 'Raj'
];
const LAST_NAMES = [
  'Sharma', 'Singh', 'Reddy', 'Gupta', 'Nair', 'Joshi', 'Patel', 'Kumar', 'Iyer', 'Mehta',
  'Rao', 'Pillai', 'Menon', 'Nambiar', 'Desai', 'Shah', 'Verma', 'Malhotra', 'Kapoor', 'Chopra'
];

const PRODUCTS = [
  { name: 'Premium Sofa', category: 'Furniture' }, { name: 'Office Chair', category: 'Furniture' },
  { name: 'Dining Table', category: 'Furniture' }, { name: 'Bookshelf', category: 'Furniture' },
  { name: 'LED TV 43"', category: 'Electronics' }, { name: 'Wireless Headphones', category: 'Electronics' },
  { name: 'Smartphone', category: 'Electronics' }, { name: 'Laptop Stand', category: 'Electronics' },
  { name: 'Cotton Saree', category: 'Apparel' }, { name: 'Formal Shirt', category: 'Apparel' },
  { name: 'Running Shoes', category: 'Sports' }, { name: 'Yoga Mat', category: 'Sports' },
  { name: 'Cookware Set', category: 'Home & Kitchen' }, { name: 'Blender', category: 'Home & Kitchen' },
  { name: 'Novel Pack', category: 'Books' }, { name: 'Desk Organizer', category: 'Office Supplies' },
  { name: 'Board Game', category: 'Toys' }, { name: 'Skincare Kit', category: 'Beauty' },
  { name: 'Car Charger', category: 'Automotive' }, { name: 'Notebook Set', category: 'Office Supplies' },
];

const EMPLOYEE_NAMES = ['Rahul Kumar', 'Neha Patel', 'Vikram Joshi', 'Anita Desai', 'Suresh Nair', 'Pooja Reddy', 'Arun Iyer', 'Divya Menon'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateTransactions(count = 1200) {
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  const out = [];
  const usedIds = new Set();

  for (let i = 0; i < count; i++) {
    let txnId;
    do {
      txnId = 'TXN' + String(10000 + i).padStart(5, '0');
    } while (usedIds.has(txnId));
    usedIds.add(txnId);

    const product = pick(PRODUCTS);
    const quantity = randInt(1, 5);
    const pricePerUnit = randInt(500, 50000);
    const totalAmount = quantity * pricePerUnit;
    const tags = Array.from({ length: randInt(0, 3) }, () => pick(TAGS_POOL));
    const tagSet = [...new Set(tags)];

    out.push({
      TransactionID: txnId,
      Date: randDate(startDate, endDate),
      CustomerID: 'C' + String(1000 + i).padStart(5, '0'),
      CustomerName: pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES),
      PhoneNumber: '+91 ' + String(randInt(6000000000, 9999999999)),
      Gender: pick(GENDERS),
      Age: randInt(18, 65),
      CustomerRegion: pick(REGIONS),
      CustomerType: pick(CUSTOMER_TYPES),
      ProductID: 'P' + (100 + (i % 200)),
      ProductName: product.name,
      Brand: pick(BRANDS),
      ProductCategory: product.category,
      Tags: tagSet,
      Quantity: quantity,
      PricePerUnit: pricePerUnit,
      DiscountPercentage: randInt(0, 3) === 0 ? randInt(5, 20) : null,
      TotalAmount: totalAmount,
      FinalAmount: totalAmount,
      PaymentMethod: pick(PAYMENT_METHODS),
      OrderStatus: pick(ORDER_STATUSES),
      DeliveryType: pick(DELIVERY_TYPES),
      StoreID: 'ST' + randInt(1, 20),
      StoreLocation: pick(REGIONS) + ' Store',
      SalespersonID: 'SP' + randInt(1, 50),
      EmployeeName: pick(EMPLOYEE_NAMES),
    });
  }
  return out;
}

async function seed() {
  if (!MONGO_URI) throw new Error('MONGO_URI not set in .env');
  await mongoose.connect(MONGO_URI);
  const count = 1200;
  console.log('Generating', count, 'diverse transactions...');
  const data = generateTransactions(count);
  await Transaction.deleteMany({});
  await Transaction.insertMany(data);
  console.log('✅ Sample data loaded. Total records:', count);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    process.exit();
  });
