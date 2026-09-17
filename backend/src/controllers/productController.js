const Product = require('../models/Product');
const Shop = require('../models/Shop');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const filter = { company: req.companyId };
  if (req.query.shopId) filter.shop = req.query.shopId;
  const products = await Product.find(filter)
    .populate('shop', 'name')
    .populate('productionArea', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, count: products.length, products });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, sku, price, stock, shop, productionArea } = req.body;

  // Shop bhi usi company ki honi chahiye - cross tenant insert block
  const shopDoc = await Shop.findOne({ _id: shop, company: req.companyId });
  if (!shopDoc) return res.status(400).json({ success: false, message: 'Select a shop from your own company' });

  const product = await Product.create({
    name, sku, price, stock, shop, productionArea: productionArea || null,
    company: req.companyId, createdBy: req.user._id
  });
  res.status(201).json({ success: true, message: 'Product created', product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, price, stock, shop, productionArea } = req.body;
  if (shop) {
    const shopDoc = await Shop.findOne({ _id: shop, company: req.companyId });
    if (!shopDoc) return res.status(400).json({ success: false, message: 'Select a shop from your own company' });
  }
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, company: req.companyId },
    { name, sku, price, stock, shop, productionArea: productionArea || null },
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product updated', product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, company: req.companyId });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});
