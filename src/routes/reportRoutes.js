const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/reports/inventory - Obtener reporte de inventario
router.get('/inventory', reportController.getInventoryReport);

module.exports = router;
