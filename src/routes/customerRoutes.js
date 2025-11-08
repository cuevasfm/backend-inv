const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/customers - Obtener todos los clientes
router.get('/', customerController.getAll);

// GET /api/customers/:id - Obtener un cliente por ID
router.get('/:id', customerController.getById);

// POST /api/customers - Crear nuevo cliente
router.post('/', customerController.create);

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', customerController.update);

// DELETE /api/customers/:id - Eliminar cliente (soft delete)
router.delete('/:id', customerController.delete);

module.exports = router;
