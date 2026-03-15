import React, { useState } from 'react';
import './Tooltip.css'; // We'll add corresponding CSS to index.css or a new file

const Tooltip = ({ term, explanation, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={explanation}
    >
      <span className="tooltip-trigger">
        {children || term}
      </span>
      {isVisible && (
        <span className="tooltip-box">
          <strong>{term}</strong>
          <span className="tooltip-text">{explanation}</span>
        </span>
      )}
    </span>
  );
};

export default Tooltip;
