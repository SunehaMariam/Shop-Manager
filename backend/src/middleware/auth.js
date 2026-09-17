const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

// 1) Token check
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired, please sign in again' });
  }

  const user = await User.findById(decoded.id).populate('company', 'name isActive');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Account not found or disabled' });
  }
  if (user.role !== 'superadmin' && user.company && user.company.isActive === false) {
    return res.status(403).json({ success: false, message: 'Your company is suspended. Contact the super admin.' });
  }

  req.user = user;
  next();
});

// 2) Role check -> authorize('superadmin'), authorize('admin','staff')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have access to this action' });
  }
  next();
};

// 3) Tenant scope - yehi asal data isolation hai.
// Admin/staff sirf apni company ka data dekhengay.
// Superadmin ?companyId=... bhej kar kisi bhi company ka data dekh sakta hai.
const tenantScope = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'superadmin') {
    const companyId = req.query.companyId || req.body.company;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Select a company first (companyId is required)' });
    }
    const exists = await Company.findById(companyId);
    if (!exists) return res.status(404).json({ success: false, message: 'Company not found' });
    req.companyId = String(companyId);
  } else {
    if (!req.user.company) {
      return res.status(403).json({ success: false, message: 'No company linked to this account' });
    }
    req.companyId = String(req.user.company._id || req.user.company);
  }
  next();
});

module.exports = { protect, authorize, tenantScope };
