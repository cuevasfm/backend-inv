const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de marcas
router.get('/', brandController.getAll);
router.get('/:id', brandController.getById);
router.post('/', brandController.create);
router.put('/:id', brandController.update);
router.delete('/:id', brandController.delete);

module.exports = router;
