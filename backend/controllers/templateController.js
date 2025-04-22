const path = require('path');
const fs = require('fs').promises;

const templateController = {
  // Get all available templates
  getAllTemplates: async (req, res) => {
    try {
      // You might store this in a database later
      const templates = [
        {
          id: 'article',
          name: 'Simple Article',
          description: 'Clean and simple article format',
          thumbnail: '/templates/article-thumb.png'
        },
        {
          id: 'report',
          name: 'Professional Report',
          description: 'Formal report with table of contents',
          thumbnail: '/templates/report-thumb.png'
        },
        {
          id: 'letter',
          name: 'Formal Letter',
          description: 'Professional letter template',
          thumbnail: '/templates/letter-thumb.png'
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },
  
  // Get template by ID
  getTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const templatePath = path.join(__dirname, `../library/templates/${id}.tex`);
      
      try {
        const templateContent = await fs.readFile(templatePath, 'utf8');
        res.json({ id, content: templateContent });
      } catch (err) {
        res.status(404).json({ error: 'Template not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = templateController;