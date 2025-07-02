import React, { memo } from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = memo(({ 
  size = 'medium', 
  text = 'Loading weather data...',
  className = '',
  ariaLabel = 'Loading content'
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div 
      className={`loading-spinner ${className}`} 
      role="status" 
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div 
        className={`spinner ${spinnerClass}`} 
        aria-hidden="true"
      >
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && (
        <p className="loading-text" aria-hidden="true">
          {text}
        </p>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );
});

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;