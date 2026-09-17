const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const shape = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company || null
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Enter both email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('company', 'name isActive');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'This account is disabled' });
  }
  if (user.role !== 'superadmin' && user.company && !user.company.isActive) {
    return res.status(403).json({ success: false, message: 'Your company is suspended. Contact the super admin.' });
  }

  res.json({ success: true, token: generateToken(user), user: shape(user) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: shape(req.user) });
});

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});
