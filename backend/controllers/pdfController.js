const puppeteer = require('puppeteer');

const generatePDF = async (req, res) => {
  let browser = null;

  try {
    const { template_id, sections } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Content sections are required' });
    }

    // Convert Tiptap JSON to HTML
    let htmlContent = '<div class="document">';
    sections.forEach(section => {
      if (section.content) {
        htmlContent += `<div class="section">`;
        if (section.title) {
          htmlContent += `<h2>${section.title}</h2>`;
        }
        htmlContent += tiptapJsonToHtml(section.content);
        htmlContent += `</div>`;
      }
    });
    htmlContent += '</div>';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Generated Document</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .document { max-width: 800px; margin: 0 auto; }
          .section { margin-bottom: 20px; }
          h1, h2, h3 { margin-top: 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      timeout: 60000
    });

    await browser.close();
    browser = null;

    // Check for download flag in query
    const isDownload = req.query.download === 'true';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      isDownload
        ? 'attachment; filename="document.pdf"'
        : 'inline; filename="document.pdf"'
    );

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message
    });
  }
};

// Helper stays the same
function tiptapJsonToHtml(json) {
  if (!json || !json.content) return '';

  let html = '';

  const processNode = (node) => {
    let nodeHtml = '';

    switch (node.type) {
      case 'doc':
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        break;

      case 'paragraph':
        nodeHtml += '<p>';
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        nodeHtml += '</p>';
        break;

      case 'heading':
        const level = node.attrs?.level || 1;
        nodeHtml += `<h${level}>`;
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        nodeHtml += `</h${level}>`;
        break;

      case 'bulletList':
        nodeHtml += '<ul>';
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        nodeHtml += '</ul>';
        break;

      case 'orderedList':
        nodeHtml += '<ol>';
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        nodeHtml += '</ol>';
        break;

      case 'listItem':
        nodeHtml += '<li>';
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        nodeHtml += '</li>';
        break;

      case 'text':
        let textContent = node.text || '';
        if (node.marks && node.marks.length > 0) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
                textContent = `<strong>${textContent}</strong>`;
                break;
              case 'italic':
                textContent = `<em>${textContent}</em>`;
                break;
              case 'underline':
                textContent = `<u>${textContent}</u>`;
                break;
            }
          });
        }
        nodeHtml += textContent;
        break;

      default:
        if (node.content) {
          node.content.forEach(child => {
            nodeHtml += processNode(child);
          });
        }
        break;
    }

    return nodeHtml;
  };

  html = processNode(json);
  return html;
}

module.exports = { generatePDF };
