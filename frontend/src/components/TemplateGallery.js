import React from 'react';
import './TemplateGallery.css';

// Import template thumbnails
import articleThumb from '../assets/templates/article-thumb.png';
import reportThumb from '../assets/templates/report-thumb.png';
import letterThumb from '../assets/templates/letter-thumb.png';

const TemplateGallery = ({ onTemplateSelect, showGallery }) => {
  const templates = [
    {
      id: 'article',
      name: 'Academic Article',
      description: 'Professional format for academic papers',
      thumbnail: articleThumb,
    },
    {
      id: 'report',
      name: 'Technical Report',
      description: 'Formal technical document with sections',
      thumbnail: reportThumb,
    },
    {
      id: 'letter',
      name: 'Formal Letter',
      description: 'Professional correspondence format',
      thumbnail: letterThumb,
    },
  ];

  if (!showGallery) {
    return null;
  }

  return (
    <div className="template-gallery-overlay">
      <div className="template-gallery-container">
        <h2>Select a Template</h2>
        <div className="templates-grid">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => onTemplateSelect(template.id)}
            >
              <img 
                src={template.thumbnail} 
                alt={template.name} 
                className="template-thumbnail" 
              />
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;