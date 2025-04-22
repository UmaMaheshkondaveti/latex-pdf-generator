import React, { useState } from 'react';
import axios from 'axios';
import Editor from './components/Editor';
import TemplateGallery from './components/TemplateGallery';
import PDFViewer from './components/PDFViewer';
import './App.css';

function App() {
  const [editorContent, setEditorContent] = useState('');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePublish = (content) => {
    setEditorContent(content);
    setShowTemplateGallery(true);
  };

  const handleTemplateSelect = async (templateId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/documents/generate', {
        content: editorContent,
        templateId: templateId
      });
      
      if (response.data.success) {
        setGeneratedPdfUrl(response.data.pdfUrl);
        setShowTemplateGallery(false);
      } else {
        setError(`Failed to generate PDF: ${response.data.message}`);
        console.error('Error details:', response.data);
      }
    } catch (err) {
      let errorMessage = 'Failed to generate PDF. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = `Error: ${err.response.data.message || 'Unknown error'}`;
        console.error('Detailed error:', err.response.data);
      } else {
        console.error('Error generating PDF:', err);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePdfViewer = () => {
    setGeneratedPdfUrl(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dynamic LaTeX Generator</h1>
      </header>
      
      <main className="app-main">
        <Editor onPublish={handlePublish} />
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Generating your PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
      
      <TemplateGallery 
        showGallery={showTemplateGallery}
        onTemplateSelect={handleTemplateSelect}
      />
      
      <PDFViewer 
        pdfUrl={generatedPdfUrl}
        onClose={handleClosePdfViewer}
      />
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Dynamic LaTeX Generator</p>
      </footer>
    </div>
  );
}

export default App;