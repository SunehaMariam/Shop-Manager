require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

connectDB();

const app = express();

// CLIENT_URL se ek ya zyada origins allow karo (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not in allowed list`));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/production-areas', require('./routes/productionAreaRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
