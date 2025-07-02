import React from 'react';

const LoadingSpinner = React.memo(() => (
    <div className="loading-spinner" role="status" aria-live="polite">
        {/* A simple div that can be styled into a spinner */}
        <div className="spinner"></div>
        <p>Loading weather data...</p>
    </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;