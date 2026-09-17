const ProductionArea = require('../models/ProductionArea');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.getAreas = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const filter = { company: req.companyId };
  if (search) filter.name = { $regex: search, $options: 'i' };
  const areas = await ProductionArea.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: areas.length, productionAreas: areas });
});

exports.createArea = asyncHandler(async (req, res) => {
  const { name, industryType, location, capacityPerDay } = req.body;
  const area = await ProductionArea.create({
    name,
    industryType,
    location,
    capacityPerDay,
    company: req.companyId,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, message: 'Production area created', productionArea: area });
});

exports.updateArea = asyncHandler(async (req, res) => {
  const { name, industryType, location, capacityPerDay, isActive } = req.body;
  const area = await ProductionArea.findOneAndUpdate(
    { _id: req.params.id, company: req.companyId },
    { name, industryType, location, capacityPerDay, isActive },
    { new: true, runValidators: true }
  );
  if (!area) return res.status(404).json({ success: false, message: 'Production area not found' });
  res.json({ success: true, message: 'Production area updated', productionArea: area });
});

exports.deleteArea = asyncHandler(async (req, res) => {
  const area = await ProductionArea.findOneAndDelete({ _id: req.params.id, company: req.companyId });
  if (!area) return res.status(404).json({ success: false, message: 'Production area not found' });
  await Product.updateMany({ productionArea: area._id }, { productionArea: null });
  res.json({ success: true, message: 'Production area deleted' });
});
