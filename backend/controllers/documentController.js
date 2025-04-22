const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');
const latexProcessor = require('../utils/latexProcessor');

const execPromise = util.promisify(exec);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

exports.generateDocument = async (req, res) => {
  try {
    const { content, templateId } = req.body;
    
    if (!content || !templateId) {
      return res.status(400).json({ message: 'Content and template ID are required' });
    }
    
    console.log(`Generating document with template: ${templateId}`);
    console.log(`Content length: ${content.length} characters`);
    
    // Get template path
    const templatePath = path.join(__dirname, '..', 'templates', `${templateId}.tex`);
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found: ${templatePath}`);
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Read template
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    console.log('Template loaded successfully');
    
    // Process HTML content to LaTeX
    const processedContent = latexProcessor.htmlToLatex(content);
    console.log('Content processed to LaTeX format');
    
    // Merge content with template
    const mergedContent = latexProcessor.mergeContentWithTemplate(templateContent, processedContent);
    console.log('Content merged with template');
    
    // Generate unique ID for the document
    const documentId = uuidv4();
    
    // Create temporary directory for LaTeX processing
    const tmpDir = path.join(outputDir, documentId);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    // Write LaTeX file
    const texFilePath = path.join(tmpDir, 'document.tex');
    fs.writeFileSync(texFilePath, mergedContent);
    console.log(`LaTeX file written to: ${texFilePath}`);
    
    try {
      // For debugging - check if pdflatex is installed
      const checkLatex = await execPromise('pdflatex --version');
      console.log('pdflatex version:', checkLatex.stdout.slice(0, 100) + '...');
    } catch (error) {
      console.error('pdflatex is not installed or not in PATH:', error.message);
      return res.status(500).json({ 
        message: 'pdflatex is not installed or not in PATH. Please install LaTeX.',
        error: error.message 
      });
    }
    
    try {
      // Compile LaTeX to PDF
      console.log(`Running pdflatex on ${texFilePath}`);
      const latexOutput = await execPromise(`pdflatex -interaction=nonstopmode -output-directory=${tmpDir} ${texFilePath}`);
      console.log('First pdflatex run completed');
      
      // Run pdflatex twice to resolve references
      await execPromise(`pdflatex -interaction=nonstopmode -output-directory=${tmpDir} ${texFilePath}`);
      console.log('Second pdflatex run completed');
      
      // Check if PDF was generated
      const pdfPath = path.join(tmpDir, 'document.pdf');
      if (!fs.existsSync(pdfPath)) {
        console.error('PDF file was not generated');
        return res.status(500).json({ 
          message: 'PDF file was not generated', 
          latexOutput: latexOutput.stdout + latexOutput.stderr 
        });
      }
      
      // Move PDF to output directory
      const outputPath = path.join(outputDir, `${documentId}.pdf`);
      fs.copyFileSync(pdfPath, outputPath);
      console.log(`PDF copied to ${outputPath}`);
      
      // Return PDF URL
      const pdfUrl = `/output/${documentId}.pdf`;
      res.json({ success: true, pdfUrl, documentId });
      
    } catch (error) {
      console.error('LaTeX compilation error:', error.message);
      return res.status(500).json({ 
        message: 'Error generating PDF', 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      });
    }
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a simple endpoint for testing
exports.test = (req, res) => {
  res.json({ message: 'Controller is working properly!' });
};