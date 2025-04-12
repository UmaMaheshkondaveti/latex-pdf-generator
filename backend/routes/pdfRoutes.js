const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// POST to generate PDF
router.post('/', pdfController.generatePDF);

module.exports = router;