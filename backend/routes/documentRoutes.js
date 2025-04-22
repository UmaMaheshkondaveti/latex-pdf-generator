const express = require('express');
const documentController = require('../controllers/documentController');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working properly!' });
});

// Generate PDF from LaTeX template
router.post('/generate', documentController.generateDocument);

// Add a test endpoint for the controller
router.get('/test-controller', documentController.test);

module.exports = router;