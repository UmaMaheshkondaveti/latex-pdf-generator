const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// Get all templates
router.get('/', templateController.getAllTemplates);

// Get specific template by ID
router.get('/:id', templateController.getTemplate);

module.exports = router;