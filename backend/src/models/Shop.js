const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Shop name is required'], trim: true },
    code: { type: String, trim: true, uppercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Tenant key - har record apni company se bandha hua hai
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Ek company ke andar shop code unique rahay ga
shopSchema.index({ company: 1, code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Shop', shopSchema);
