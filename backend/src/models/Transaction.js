const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    TransactionID: { type: String, required: true, index: true },
    Date: { type: Date, required: true },
    CustomerID: { type: String, required: true },
    CustomerName: { type: String, required: true },
    PhoneNumber: { type: String },
    Gender: { type: String },
    Age: { type: Number },
    CustomerRegion: { type: String, required: true },
    CustomerType: { type: String },
    ProductID: { type: String, required: true },
    ProductName: { type: String, required: true },
    Brand: { type: String },
    ProductCategory: { type: String },
    Tags: [{ type: String }],
    Quantity: { type: Number, required: true },
    PricePerUnit: { type: Number },
    DiscountPercentage: { type: Number },
    TotalAmount: { type: Number, required: true },
    FinalAmount: { type: Number },
    PaymentMethod: { type: String },
    OrderStatus: { type: String },
    DeliveryType: { type: String },
    StoreID: { type: String },
    StoreLocation: { type: String },
    SalespersonID: { type: String },
    EmployeeName: { type: String },
  },
  {
    collection: 'transactions',
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
