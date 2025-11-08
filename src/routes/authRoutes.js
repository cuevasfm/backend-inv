const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validaciones
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'cashier', 'warehouse', 'promoter'])
    .withMessage('Invalid role'),
  validate
];

// Rutas públicas
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refresh);

// Rutas protegidas
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// Ruta de registro (solo admin)
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  registerValidation,
  authController.register
);

module.exports = router;
