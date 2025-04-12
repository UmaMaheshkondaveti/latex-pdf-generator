const db = require('../models/db');

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await db.getAllTemplates();
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await db.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// Create a new template
exports.createTemplate = async (req, res) => {
  try {
    const newTemplate = await db.createTemplate(req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Update a template
exports.updateTemplate = async (req, res) => {
  try {
    const updated = await db.updateTemplate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
  try {
    const deleted = await db.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};