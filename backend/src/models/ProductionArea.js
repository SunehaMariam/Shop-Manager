const mongoose = require('mongoose');

const productionAreaSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Production area name is required'], trim: true },
    industryType: { type: String, trim: true, default: 'General' },
    location: { type: String, trim: true },
    capacityPerDay: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductionArea', productionAreaSchema);
