import React from 'react';

function LoadingSpinner() {
    return (
        <div className="loading-spinner">
            {/* A simple div that can be styled into a spinner */}
            <div className="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    );
}

export default LoadingSpinner;