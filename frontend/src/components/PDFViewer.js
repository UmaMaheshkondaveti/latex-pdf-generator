import React from 'react';
import './PDFViewer.css';

const PDFViewer = ({ pdfUrl, onClose }) => {
  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <h2>Generated PDF</h2>
          <div className="pdf-viewer-actions">
            <a 
              href={pdfUrl} 
              download="document.pdf" 
              className="download-button"
            >
              Download
            </a>
            <button className="close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="pdf-viewer-content">
          <iframe 
            src={pdfUrl} 
            title="Generated PDF" 
            width="100%" 
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;