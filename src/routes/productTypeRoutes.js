const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de tipos de producto
router.get('/', productTypeController.getAll);
router.get('/:id', productTypeController.getById);
router.post('/', productTypeController.create);
router.put('/:id', productTypeController.update);
router.delete('/:id', productTypeController.delete);

module.exports = router;
