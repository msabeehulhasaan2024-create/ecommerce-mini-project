const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { authRoutes } = require('./routes/authRoutes');
const { productRoutes } = require('./routes/productRoutes');
const { orderRoutes } = require('./routes/orderRoutes');

// Load environment variables
dotenv.config();

// On local non-Vercel environment, apply fallback DNS servers if needed for local ISP SRV resolution
if (!process.env.VERCEL) {
  try {
    const dns = require('dns');
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch (err) {
    console.warn('Could not set custom DNS servers locally:', err.message);
  }
}

// Connect to MongoDB immediately at startup
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (Requirement 8)
const allowedOrigins = [
  'https://ecommerce-mini-project-o4nr.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
];

if (process.env.CLIENT_URL) {
  const customOrigin = process.env.CLIENT_URL.trim().replace(/\/+$/, '');
  if (!allowedOrigins.includes(customOrigin)) {
    allowedOrigins.push(customOrigin);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

// Requirement 10: Simple GET "/" route that returns "API running" to test the deployment
app.get('/', (req, res) => {
  res.send('API running');
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TechVault E-Commerce API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Database connection middleware to ensure connection on serverless API calls
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error on route:', req.method, req.path, err);
    res.status(500).json({
      message: 'Server error: Database connection failed. Please verify MONGO_URI in Vercel.',
      error: err.message,
    });
  }
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Catch-all 404 handler for undefined API routes (Express 5 syntax)
app.all('/*splat', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler with full console.error for Vercel Logs (Requirement 9)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error in Vercel Logs:', err);
  res.status(500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Requirement 5: Keep app.listen only when not running on Vercel
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });
}

// Requirement 5: Export express app for Vercel serverless
module.exports = app;
