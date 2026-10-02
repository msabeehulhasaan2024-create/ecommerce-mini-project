const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { authRoutes } = require('./routes/authRoutes');
const { productRoutes } = require('./routes/productRoutes');
const { orderRoutes } = require('./routes/orderRoutes');
const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TechVault E-Commerce API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Root check
app.get('/', (req, res) => {
  res.send('TechVault Backend Server is Active.');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
