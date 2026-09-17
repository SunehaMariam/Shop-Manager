const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/shops
exports.getShops = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const filter = { company: req.companyId };            // <- tenant filter, hamesha lagta hai
  if (search) filter.name = { $regex: search, $options: 'i' };

  const shops = await Shop.find(filter).sort({ createdAt: -1 }).lean();
  const withCounts = await Promise.all(
    shops.map(async (s) => ({ ...s, productCount: await Product.countDocuments({ shop: s._id }) }))
  );
  res.json({ success: true, count: withCounts.length, shops: withCounts });
});

// GET /api/shops/:id
exports.getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.id, company: req.companyId }).lean();
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  const products = await Product.find({ shop: shop._id }).lean();
  res.json({ success: true, shop, products });
});

// POST /api/shops
exports.createShop = asyncHandler(async (req, res) => {
  const { name, code, phone, address } = req.body;
  const shop = await Shop.create({
    name,
    code,
    phone,
    address,
    company: req.companyId,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, message: 'Shop created', shop });
});

// PUT /api/shops/:id
exports.updateShop = asyncHandler(async (req, res) => {
  const { name, code, phone, address, isActive } = req.body;
  const shop = await Shop.findOneAndUpdate(
    { _id: req.params.id, company: req.companyId },
    { name, code, phone, address, isActive },
    { new: true, runValidators: true }
  );
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  res.json({ success: true, message: 'Shop updated', shop });
});

// DELETE /api/shops/:id
exports.deleteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOneAndDelete({ _id: req.params.id, company: req.companyId });
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  await Product.deleteMany({ shop: shop._id });
  await User.updateMany({ shop: shop._id }, { shop: null });
  res.json({ success: true, message: 'Shop deleted' });
});
