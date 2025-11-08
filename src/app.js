const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting - Configuración más permisiva para desarrollo
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 en desarrollo, 100 en producción
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Excluir health check del rate limiting
  skip: (req) => req.path === '/health'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/product-types', require('./routes/productTypeRoutes'));
app.use('/api/unit-types', require('./routes/unitTypeRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/promoters', require('./routes/promoterRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));
app.use('/api/mobile', require('./routes/mobileRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;
