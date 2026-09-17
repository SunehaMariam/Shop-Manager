require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

// Sirf super admin banata hai. Baaqi companies aur admins UI se bantay hain.
(async () => {
  await connectDB();

  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@saas.com').toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Super@123';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: 'superadmin', company: null });
    console.log('Super admin created');
    console.log(`  email:    ${email}`);
    console.log(`  password: ${password}`);
  }

  await mongoose.connection.close();
  process.exit(0);
})();
