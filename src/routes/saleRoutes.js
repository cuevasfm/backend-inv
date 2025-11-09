const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const saleController = require('../controllers/saleController');

// Obtener todas las ventas
router.get('/', authenticate, saleController.getAll);

// Obtener resumen de ventas
router.get('/summary', authenticate, saleController.getSummary);

// Obtener una venta por ID
router.get('/:id', authenticate, saleController.getById);

// Crear nueva venta
router.post('/', authenticate, saleController.create);

// Cancelar venta
router.post('/:id/cancel', authenticate, saleController.cancel);

module.exports = router;
