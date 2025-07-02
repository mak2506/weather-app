import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import ForecastItem from "./ForecastItem";
import LoadingSpinner from "./LoadingSpinner";

const WeatherForecast = memo(({ 
  forecastData,
  isLoading,
  error,
  className = ''
}) => {
  // Memoized daily forecasts processing
  const dailyForecasts = useMemo(() => {
    if (!forecastData?.list || forecastData.list.length === 0) {
      return [];
    }

    try {
      // Filter to get one forecast per day (at noon/afternoon time)
      const filteredForecasts = forecastData.list.filter((item, index) => {
        const date = new Date(item.dt * 1000);
        const hours = date.getHours();
        // Get forecasts around noon (between 10 AM and 2 PM) and every 8th item
        return index % 8 === 4 && hours >= 10 && hours <= 14;
      });

      // If no forecasts found with the filter, get the first forecast of each day
      if (filteredForecasts.length === 0) {
        const dailyForecasts = [];
        const seenDays = new Set();
        
        forecastData.list.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toDateString();
          
          if (!seenDays.has(dayKey)) {
            seenDays.add(dayKey);
            dailyForecasts.push(item);
          }
        });
        
        return dailyForecasts.slice(0, 5); // Limit to 5 days
      }

      return filteredForecasts.slice(0, 5); // Limit to 5 days
    } catch (error) {
      console.error('Error processing forecast data:', error);
      return [];
    }
  }, [forecastData]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`weather-forecast loading ${className}`}>
        <h3>5-Day Forecast</h3>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`weather-forecast error ${className}`} role="alert">
        <h3>5-Day Forecast</h3>
        <div className="error-message">
          <p>Error loading forecast: {error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // No forecast data state
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    return (
      <div className={`weather-forecast no-data ${className}`}>
        <h3>5-Day Forecast</h3>
        <p>No forecast data available. Weather data is required to show forecast.</p>
      </div>
    );
  }

  // No daily forecasts state
  if (dailyForecasts.length === 0) {
    return (
      <div className={`weather-forecast no-data ${className}`}>
        <h3>5-Day Forecast</h3>
        <p>No detailed forecast available for this location.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>5-Day Weather Forecast</title>
        <meta name="description" content="5-day weather forecast with detailed temperature and conditions" />
      </Helmet>
      
      <div className={`weather-forecast ${className}`}>
        <h3>5-Day Forecast</h3>
        <div className="forecast-list" role="list">
          {dailyForecasts.map((forecastItem, index) => (
            <ForecastItem 
              key={`${forecastItem.dt}-${forecastItem.dt_txt}-${index}`} 
              forecast={forecastItem}
              index={index}
            />
          ))}
        </div>
        
        {dailyForecasts.length < 5 && (
          <p className="forecast-note">
            Note: Only {dailyForecasts.length} days of forecast data available.
          </p>
        )}
      </div>
    </>
  );
});

WeatherForecast.propTypes = {
  forecastData: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

WeatherForecast.displayName = 'WeatherForecast';

export default WeatherForecast;