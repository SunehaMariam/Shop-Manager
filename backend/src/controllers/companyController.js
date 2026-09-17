const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Shop = require('../models/Shop');
const ProductionArea = require('../models/ProductionArea');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/companies  (superadmin only)
// Company + uska apna admin ek hi request me bantay hain
exports.createCompany = asyncHandler(async (req, res) => {
  const { name, businessType, phone, address, adminName, adminEmail, adminPassword } = req.body;

  if (!name || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({
      success: false,
      message: 'Company name and admin name, email, password are required'
    });
  }
  if (adminPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Admin password must be at least 6 characters' });
  }

  const emailTaken = await User.findOne({ email: adminEmail.toLowerCase() });
  if (emailTaken) {
    return res.status(400).json({ success: false, message: 'This admin email is already in use' });
  }

  const session = await mongoose.startSession();
  let company, admin;
  try {
    // Transaction replica set par chalti hai; standalone Mongo par fallback ho jata hai
    await session.withTransaction(async () => {
      const created = await Company.create(
        [{ name, businessType, phone, address, createdBy: req.user._id }],
        { session }
      );
      company = created[0];

      const createdAdmin = await User.create(
        [{ name: adminName, email: adminEmail, password: adminPassword, role: 'admin', company: company._id }],
        { session }
      );
      admin = createdAdmin[0];
    });
  } catch (err) {
    if (err.code === 20 || /Transaction numbers|replica set|transactions are not supported/i.test(err.message)) {
      company = await Company.create({ name, businessType, phone, address, createdBy: req.user._id });
      try {
        admin = await User.create({
          name: adminName, email: adminEmail, password: adminPassword, role: 'admin', company: company._id
        });
      } catch (userErr) {
        await Company.findByIdAndDelete(company._id); // rollback by hand
        throw userErr;
      }
    } else {
      throw err;
    }
  } finally {
    session.endSession();
  }

  res.status(201).json({
    success: true,
    message: 'Company created with its admin',
    company,
    admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }
  });
});

// GET /api/companies  (superadmin only)
exports.getCompanies = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

  const companies = await Company.find(filter).sort({ createdAt: -1 }).lean();

  const withCounts = await Promise.all(
    companies.map(async (c) => {
      const [shops, areas, users] = await Promise.all([
        Shop.countDocuments({ company: c._id }),
        ProductionArea.countDocuments({ company: c._id }),
        User.countDocuments({ company: c._id })
      ]);
      const admin = await User.findOne({ company: c._id, role: 'admin' }).select('name email').lean();
      return { ...c, counts: { shops, areas, users }, admin: admin || null };
    })
  );

  res.json({ success: true, count: withCounts.length, companies: withCounts });
});

// GET /api/companies/:id
exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).lean();
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

  const [users, shops, areas, products] = await Promise.all([
    User.find({ company: company._id }).select('name email role isActive').lean(),
    Shop.find({ company: company._id }).sort({ createdAt: -1 }).lean(),
    ProductionArea.find({ company: company._id }).sort({ createdAt: -1 }).lean(),
    Product.countDocuments({ company: company._id })
  ]);

  res.json({ success: true, company, users, shops, productionAreas: areas, productCount: products });
});

// PUT /api/companies/:id
exports.updateCompany = asyncHandler(async (req, res) => {
  const { name, businessType, phone, address, isActive } = req.body;
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { name, businessType, phone, address, isActive },
    { new: true, runValidators: true }
  );
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
  res.json({ success: true, message: 'Company updated', company });
});

// DELETE /api/companies/:id -> company aur uska sara data
exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

  await Promise.all([
    Product.deleteMany({ company: company._id }),
    Shop.deleteMany({ company: company._id }),
    ProductionArea.deleteMany({ company: company._id }),
    User.deleteMany({ company: company._id })
  ]);
  await company.deleteOne();

  res.json({ success: true, message: 'Company and all of its data deleted' });
});

// PUT /api/companies/:id/admin-password -> superadmin admin ka password reset kar sakta hai
exports.resetAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const admin = await User.findOne({ company: req.params.id, role: 'admin' }).select('+password');
  if (!admin) return res.status(404).json({ success: false, message: 'No admin found for this company' });

  admin.password = newPassword;
  await admin.save();
  res.json({ success: true, message: `Password reset for ${admin.email}` });
});
