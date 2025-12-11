const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    customerRegion: { type: String, required: true },
    customerType: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    productCategory: { type: String, required: true },
    tags: [{ type: String }],
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    orderStatus: { type: String, required: true },
    deliveryType: { type: String, required: true },
    storeId: { type: String, required: true },
    storeLocation: { type: String, required: true },
    salespersonId: { type: String, required: true },
    employeeName: { type: String, required: true },
  },
  {
    collection: 'transactions',
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);

