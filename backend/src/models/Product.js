const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    sku: { type: String, trim: true, uppercase: true },
    price: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    productionArea: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionArea', default: null },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
