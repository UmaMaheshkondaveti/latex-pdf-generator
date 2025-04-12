import React from 'react';
import './PublishButton.css';

const PublishButton = ({ onClick, disabled }) => {
  return (
    <button 
      className="publish-button" 
      onClick={onClick}
      disabled={disabled}
    >
      Publish
    </button>
  );
};

export default PublishButton;