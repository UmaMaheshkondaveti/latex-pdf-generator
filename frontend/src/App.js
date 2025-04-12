import React, { useState, useEffect } from 'react';
import './App.css';
import TiptapEditor from './components/TiptapEditor';
import PublishButton from './components/PublishButton';
import TemplateListModal from './components/TemplateListModal';
import PDFViewer from './components/PDFViewer';

function App() {
  const [editorContent, setEditorContent] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Check if there's a saved draft in localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('editorDraft');
    if (savedDraft) {
      try {
        setEditorContent(JSON.parse(savedDraft));
        setEditorInitialized(true);
      } catch (error) {
        console.error('Error loading saved draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage on content change
  useEffect(() => {
    if (editorContent && editorInitialized) {
      localStorage.setItem('editorDraft', JSON.stringify(editorContent));
    }
  }, [editorContent, editorInitialized]);

  const handleEditorUpdate = (content) => {
    setEditorContent(content);
    if (!editorInitialized) {
      setEditorInitialized(true);
    }
  };

  const handlePublishClick = () => {
    setShowTemplateModal(true);
  };

  const handleModalClose = () => {
    setShowTemplateModal(false);
  };

  const handleTemplateSelect = async (templateId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Generating PDF with template:', templateId);
      console.log('Editor content:', editorContent);
      
      const response = await fetch('http://localhost:5000/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          sections: [
            {
              title: "Resume Content",
              content: editorContent
            }
          ]
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowTemplateModal(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error.message || 'Failed to generate PDF. Please try again.');
      alert('Failed to generate PDF. Please try again. Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dynamic LaTeX Template Generator</h1>
      </header>
      
      <main className="App-main">
        <div className="editor-section">
          <TiptapEditor onUpdate={handleEditorUpdate} />
        </div>
        
        {pdfUrl && (
          <div className="preview-section">
            <PDFViewer pdfUrl={pdfUrl} />
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
      
      <PublishButton 
        onClick={handlePublishClick} 
        disabled={!editorContent} 
      />
      
      {showTemplateModal && (
        <TemplateListModal 
          onClose={handleModalClose} 
          onSelect={handleTemplateSelect}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;