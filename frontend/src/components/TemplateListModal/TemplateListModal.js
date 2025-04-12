import React, { useState, useEffect } from 'react';
import './TemplateListModal.css';

const TemplateListModal = ({ onClose, onSelect, loading }) => {
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        console.log('Fetching templates from backend...');
        const response = await fetch('http://localhost:5000/api/templates');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Templates received:', data);
        setTemplates(data);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.message || 'Failed to load templates. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Select a Template</h2>
        
        {isLoading ? (
          <p>Loading templates...</p>
        ) : error ? (
          <div>
            <p className="error">{error}</p>
            <p>Make sure the backend server is running at http://localhost:5000</p>
          </div>
        ) : templates.length === 0 ? (
          <p>No templates available. Please add some templates to the database.</p>
        ) : (
          <ul className="template-list">
            {templates.map((template) => (
              <li 
                key={template.id} 
                className="template-item"
                onClick={() => onSelect(template.id)}
              >
                <h3>{template.title}</h3>
                {template.description && <p>{template.description}</p>}
              </li>
            ))}
          </ul>
        )}
        
        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          {loading && <span>Generating PDF...</span>}
        </div>
      </div>
    </div>
  );
};

export default TemplateListModal;