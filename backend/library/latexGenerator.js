const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const mkdir = util.promisify(fs.mkdir);
const execPromise = util.promisify(exec);

// Utility to convert Tiptap JSON to LaTeX
function tiptapToLatex(content) {
  let latexContent = '';
  
  // Process nodes recursively
  function processNode(node) {
    if (node.type === 'doc') {
      return node.content ? node.content.map(processNode).join('\n') : '';
    } else if (node.type === 'paragraph') {
      return node.content ? node.content.map(processNode).join('') + '\n\n' : '\n\n';
    } else if (node.type === 'text') {
      let text = node.text || '';
      
      // Handle marks
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `\\textbf{${text}}`;
          } else if (mark.type === 'italic') {
            text = `\\textit{${text}}`;
          } else if (mark.type === 'underline') {
            text = `\\underline{${text}}`;
          }
        }
      }
      
      return text;
    } else if (node.type === 'heading') {
      const level = node.attrs.level;
      const content = node.content ? node.content.map(processNode).join('') : '';
      if (level === 1) {
        return `\\section{${content}}\n\n`;
      } else if (level === 2) {
        return `\\subsection{${content}}\n\n`;
      } else {
        return `\\subsubsection{${content}}\n\n`;
      }
    } else if (node.type === 'bulletList') {
      return `\\begin{itemize}\n${node.content ? node.content.map(processNode).join('') : ''}\\end{itemize}\n\n`;
    } else if (node.type === 'orderedList') {
      return `\\begin{enumerate}\n${node.content ? node.content.map(processNode).join('') : ''}\\end{enumerate}\n\n`;
    } else if (node.type === 'listItem') {
      return `\\item ${node.content ? node.content.map(processNode).join('') : ''}\n`;
    } else {
      // Default case for other node types
      return node.content ? node.content.map(processNode).join('') : '';
    }
  }
  
  // Start processing from the root node
  latexContent = processNode(content);
  
  return latexContent;
}

// Main function to generate PDF from LaTeX template and Tiptap content
exports.generateLatexPDF = async (latexTemplate, sections) => {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.resolve(__dirname, '../temp');
    await mkdir(tempDir, { recursive: true });
    
    // Create unique filename
    const timestamp = Date.now();
    const texFilePath = path.join(tempDir, `document_${timestamp}.tex`);
    const pdfFilePath = path.join(tempDir, `document_${timestamp}.pdf`);
    
    // Process template with sections
    let processedLatex = latexTemplate;
    
    for (const section of sections) {
      const latexContent = tiptapToLatex(section.content);
      
      // Replace placeholder with content
      if (section.title === "Main" || section.title === "Auto-Generated Section") {
        processedLatex = processedLatex.replace('{{CONTENT}}', latexContent);
      } else {
        // For custom sections, we can add a specific marker in templates
        const sectionMarker = `{{SECTION:${section.title}}}`;
        if (processedLatex.includes(sectionMarker)) {
          processedLatex = processedLatex.replace(sectionMarker, latexContent);
        } else {
          // If no specific marker, append to general content
          processedLatex = processedLatex.replace('{{CONTENT}}', `${latexContent}\n{{CONTENT}}`);
        }
      }
    }
    
    // Remove any remaining content placeholders
    processedLatex = processedLatex.replace('{{CONTENT}}', '');
    
    // Write the processed LaTeX to file
    await writeFile(texFilePath, processedLatex);
    
    // Compile LaTeX to PDF
    await execPromise(`pdflatex -output-directory="${tempDir}" "${texFilePath}"`);
    
    // Read the generated PDF
    const pdfBuffer = await readFile(pdfFilePath);
    
    // Clean up temporary files (optional)
    // fs.unlinkSync(texFilePath);
    // fs.unlinkSync(pdfFilePath);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};