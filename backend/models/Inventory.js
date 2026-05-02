const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
  name: { type: String, required: true },
  itemNumber: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  sizeStocks: { type: mongoose.Schema.Types.Mixed }, 
  status: { type: String, default: 'ACTIVE' },
  category: { type: String, required: true },
  subCategory: { type: String },
  discountPercentage: { type: Number, default: 0 },
  colors: [String],
  materialCare: { type: String },
  shippingReturns: { type: String },
  sustainability: { type: String },
  isSeasonal: { type: Boolean, default: false },
}, { timestamps: true, collection: 'inventories' });

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
