const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validaciones
const productValidation = [
  body('barcode').notEmpty().withMessage('Barcode is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('purchasePrice')
    .notEmpty().withMessage('Purchase price is required')
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('retailPrice')
    .notEmpty().withMessage('Retail price is required')
    .isFloat({ min: 0 }).withMessage('Retail price must be a positive number'),
  validate
];

// Rutas públicas (requieren autenticación)
router.get('/', authenticate, productController.getAllProducts);
router.get('/low-stock', authenticate, productController.getLowStockProducts);
router.get('/price-list', authenticate, productController.getProductsForPriceList);
router.get('/barcode/:barcode', authenticate, productController.getProductByBarcode);
router.get('/:id', authenticate, productController.getProductById);

// Rutas protegidas (requieren roles específicos)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'warehouse'),
  productValidation,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'warehouse'),
  productValidation,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  productController.deleteProduct
);

router.post(
  '/:id/adjust-stock',
  authenticate,
  authorize('admin', 'manager', 'warehouse'),
  [
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt().withMessage('Quantity must be an integer'),
    validate
  ],
  productController.adjustStock
);

module.exports = router;
