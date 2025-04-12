import React from 'react';
import './PDFViewer.css';

const PDFViewer = ({ pdfUrl }) => {
  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-header">
        <h3>Generated PDF</h3>
        <div className="pdf-actions">
          <a 
            href={pdfUrl} 
            download="document.pdf" 
            className="download-button"
            title="Download PDF"
          >
            Download
          </a>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="open-button"
            title="Open in new tab"
          >
            Open in new tab
          </a>
        </div>
      </div>
      <div className="pdf-viewer-content">
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          className="pdf-iframe"
        />
      </div>
    </div>
  );
};

export default PDFViewer;