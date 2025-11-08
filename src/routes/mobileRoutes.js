const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Placeholder - TODO: Implement controller
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Endpoint not yet implemented', route: req.baseUrl });
});

module.exports = router;
