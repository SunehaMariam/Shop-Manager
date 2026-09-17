const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Admin apni company ke staff users bana/dekh sakta hai
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ company: req.companyId })
    .select('name email role isActive shop createdAt')
    .populate('shop', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, count: users.length, users });
});

exports.createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, shop } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ success: false, message: 'This email is already in use' });

  const user = await User.create({
    name, email, password, role: 'staff', company: req.companyId, shop: shop || null
  });
  res.status(201).json({
    success: true,
    message: 'Staff account created',
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

exports.toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, company: req.companyId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'The company admin cannot be disabled here' });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: user.isActive ? 'User enabled' : 'User disabled', user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, company: req.companyId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'The company admin cannot be deleted here' });
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});
