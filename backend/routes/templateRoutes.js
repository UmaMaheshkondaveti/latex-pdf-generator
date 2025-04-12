const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res, next) => {
  try {
    const templates = await db.getAllTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const template = await db.getTemplateById(req.params.id);
    res.json(template);
  } catch (err) {
    next(err);
  }
});

module.exports = router;