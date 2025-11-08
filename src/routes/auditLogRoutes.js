const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de consulta de logs
router.get('/', auditLogController.getAll);
router.get('/stats', auditLogController.getStats);

module.exports = router;
