import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from './LoadingSpinner';

const WeatherDisplay = memo(({ 
  weatherData, 
  isLoading, 
  error,
  className = '' 
}) => {
  // Memoized utility function for time formatting
  const formatTime = useMemo(() => (unixTimestamp) => {
    if (!unixTimestamp) return 'N/A';
    try {
      const date = new Date(unixTimestamp * 1000);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  }, []);

  // Memoized weather data processing
  const processedWeatherData = useMemo(() => {
    if (!weatherData) return null;

    try {
      const { name, main, weather, wind, sys } = weatherData;

      return {
        name,
        temperature: main?.temp ?? 'N/A',
        feelsLike: main?.feels_like ?? 'N/A',
        humidity: main?.humidity ?? 'N/A',
        windSpeed: wind?.speed ?? 'N/A',
        minTemp: main?.temp_min ?? 'N/A',
        maxTemp: main?.temp_max ?? 'N/A',
        pressure: main?.pressure ?? 'N/A',
        visibility: weatherData.visibility ? Math.round(weatherData.visibility / 1000) : 'N/A',
        sunrise: formatTime(sys?.sunrise),
        sunset: formatTime(sys?.sunset),
        description: weather?.[0]?.description ?? 'N/A',
        iconCode: weather?.[0]?.icon ?? '',
        mainCondition: weather?.[0]?.main ?? '',
      };
    } catch (error) {
      console.error('Error processing weather data:', error);
      return null;
    }
  }, [weatherData, formatTime]);

  // Memoized icon URL with error handling
  const iconUrl = useMemo(() => {
    if (!processedWeatherData?.iconCode) return '';
    return `https://openweathermap.org/img/wn/${processedWeatherData.iconCode}@2x.png`;
  }, [processedWeatherData?.iconCode]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`weather-card loading ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`weather-card error ${className}`} role="alert">
        <div className="error-message">
          <h3>Error Loading Weather Data</h3>
          <p>{error || 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!weatherData || !processedWeatherData) {
    return (
      <div className={`weather-card no-data ${className}`}>
        <div className="no-data-message">
          <h3>No Weather Data</h3>
          <p>Enter a city name or enable location services to get weather information.</p>
        </div>
      </div>
    );
  }

  const {
    name,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    minTemp,
    maxTemp,
    pressure,
    visibility,
    sunrise,
    sunset,
    description,
    mainCondition
  } = processedWeatherData;

  return (
    <>
      <Helmet>
        <title>{name ? `Weather in ${name}` : 'Weather App'}</title>
        <meta name="description" content={`Current weather conditions in ${name}: ${description}, ${temperature}°C`} />
      </Helmet>
      
      <div className={`weather-card ${className}`}>
        <h2>Current Weather In {name}</h2>
        <div className="weather-card-in">
          <div className='weather-card-left'>
            {iconUrl && (
              <img 
                src={iconUrl} 
                alt={description} 
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.warn('Failed to load weather icon');
                }}
                className="weather-icon"
              />
            )}
            <p className="temperature" aria-label={`Temperature ${temperature} degrees Celsius`}>
              {temperature}°C
            </p>
            <p className="description" aria-label={`Weather description: ${description}`}>
              {description}
            </p>
          </div>
          <div className='weather-card-right'>
            <div className="details">
              <div className="detail-item">
                <span className="detail-label">Feels Like:</span>
                <span className="detail-value">{feelsLike}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity:</span>
                <span className="detail-value">{humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind Speed:</span>
                <span className="detail-value">{windSpeed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Min Temp:</span>
                <span className="detail-value">{minTemp}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Max Temp:</span>
                <span className="detail-value">{maxTemp}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pressure:</span>
                <span className="detail-value">{pressure} hPa</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Visibility:</span>
                <span className="detail-value">{visibility} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sunrise:</span>
                <span className="detail-value">{sunrise}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sunset:</span>
                <span className="detail-value">{sunset}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

WeatherDisplay.propTypes = {
  weatherData: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

WeatherDisplay.displayName = 'WeatherDisplay';

export default WeatherDisplay;