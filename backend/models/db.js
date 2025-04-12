const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

// Use environment variable for database path
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Promisify database methods
db.runAsync = promisify(db.run);
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// Initialize database with transactions
exports.initialize = async () => {
  try {
    // Create templates table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) <= 100),
        description TEXT CHECK(length(description) <= 500),
        latex_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check for existing templates
    const { count } = await db.getAsync('SELECT COUNT(*) as count FROM templates');
    
    if (count === 0) {
      await db.runAsync('BEGIN TRANSACTION');
      try {
        const sampleTemplates = [
          {
            title: 'Modern Resume',
            description: 'A clean and modern resume template',
            latex_content: `\\documentclass{article}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\title{Modern Resume}
\\author{{{NAME}}}
\\date{\\today}

\\begin{document}
\\maketitle

{{CONTENT}}

\\end{document}`
          },
          {
            title: 'Academic CV',
            description: 'Professional academic curriculum vitae',
            latex_content: `\\documentclass{article}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\title{Academic CV}
\\author{{{NAME}}}
\\date{\\today}

\\begin{document}
\\maketitle

{{CONTENT}}

\\end{document}`
          }
        ];

        for (const template of sampleTemplates) {
          await db.runAsync(
            'INSERT INTO templates (title, description, latex_content) VALUES (?, ?, ?)',
            [template.title, template.description, template.latex_content]
          );
        }
        await db.runAsync('COMMIT');
      } catch (err) {
        await db.runAsync('ROLLBACK');
        throw err;
      }
    }
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw new Error('Failed to initialize database');
  }
};

// Database operations with improved error handling
exports.getAllTemplates = async () => {
  try {
    return await db.allAsync('SELECT id, title, description FROM templates');
  } catch (err) {
    throw new Error(`Failed to fetch templates: ${err.message}`);
  }
};

exports.getTemplateById = async (id) => {
  try {
    const template = await db.getAsync('SELECT * FROM templates WHERE id = ?', [id]);
    if (!template) throw new Error('Template not found');
    return template;
  } catch (err) {
    throw new Error(`Failed to fetch template: ${err.message}`);
  }
};

exports.createTemplate = async (template) => {
  const { title, description, latex_content } = template;
  try {
    const { lastID } = await db.runAsync(
      'INSERT INTO templates (title, description, latex_content) VALUES (?, ?, ?)',
      [title, description, latex_content]
    );
    return { id: lastID, ...template };
  } catch (err) {
    throw new Error(`Failed to create template: ${err.message}`);
  }
};

exports.updateTemplate = async (id, template) => {
  const { title, description, latex_content } = template;
  try {
    const { changes } = await db.runAsync(
      `UPDATE templates 
       SET title = ?, description = ?, latex_content = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, description, latex_content, id]
    );
    if (changes === 0) throw new Error('Template not found');
    return true;
  } catch (err) {
    throw new Error(`Failed to update template: ${err.message}`);
  }
};

exports.deleteTemplate = async (id) => {
  try {
    const { changes } = await db.runAsync('DELETE FROM templates WHERE id = ?', [id]);
    if (changes === 0) throw new Error('Template not found');
    return true;
  } catch (err) {
    throw new Error(`Failed to delete template: ${err.message}`);
  }
};

// Close database connection gracefully
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      return;
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});