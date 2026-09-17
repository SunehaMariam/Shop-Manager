const Company = require('../models/Company');
const Shop = require('../models/Shop');
const ProductionArea = require('../models/ProductionArea');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/super  (superadmin)
exports.superStats = asyncHandler(async (req, res) => {
  const [companies, activeCompanies, shops, areas, products, admins] = await Promise.all([
    Company.countDocuments(),
    Company.countDocuments({ isActive: true }),
    Shop.countDocuments(),
    ProductionArea.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'admin' })
  ]);

  const recent = await Company.find().sort({ createdAt: -1 }).limit(5).select('name createdAt isActive').lean();

  res.json({
    success: true,
    stats: { companies, activeCompanies, shops, productionAreas: areas, products, admins },
    recentCompanies: recent
  });
});

// GET /api/dashboard/company  (admin / staff) - sirf apni company
exports.companyStats = asyncHandler(async (req, res) => {
  const scope = { company: req.companyId };
  const [shops, activeShops, areas, products, users] = await Promise.all([
    Shop.countDocuments(scope),
    Shop.countDocuments({ ...scope, isActive: true }),
    ProductionArea.countDocuments(scope),
    Product.countDocuments(scope),
    User.countDocuments(scope)
  ]);

  const stockAgg = await Product.aggregate([
    { $match: { company: new (require('mongoose').Types.ObjectId)(String(req.companyId)) } },
    { $group: { _id: null, totalStock: { $sum: '$stock' }, stockValue: { $sum: { $multiply: ['$stock', '$price'] } } } }
  ]);

  const recentShops = await Shop.find(scope).sort({ createdAt: -1 }).limit(5).select('name code createdAt').lean();

  res.json({
    success: true,
    stats: {
      shops,
      activeShops,
      productionAreas: areas,
      products,
      users,
      totalStock: stockAgg[0]?.totalStock || 0,
      stockValue: stockAgg[0]?.stockValue || 0
    },
    recentShops
  });
});
