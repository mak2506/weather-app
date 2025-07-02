import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

const WeatherDisplay = React.memo(function WeatherDisplay({ weatherData, isLoading, error }) {
    // Memoize formatTime to avoid recreation on each render
    const formatTime = useCallback((unixTimestamp) => {
        if (!unixTimestamp) return 'N/A';
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="error-message" role="alert">Error: {error}</p>;
    }

    if (!weatherData) {
        return <p>Enter a city to get weather information.</p>;
    }

    const { name, main, weather, wind, sys } = weatherData;
    const temperature = main?.temp ?? 'N/A';
    const feelsLike = main?.feels_like ?? 'N/A';
    const humidity = main?.humidity ?? 'N/A';
    const windSpeed = wind?.speed ?? 'N/A';
    const minTemp = main?.temp_min ?? 'N/A';
    const maxTemp = main?.temp_max ?? 'N/A';
    const { sunrise, sunset } = sys || {};

    const description = weather?.[0]?.description ?? 'N/A';
    const iconCode = weather?.[0]?.icon ?? '';
    const iconUrl = iconCode ? `http://openweathermap.org/img/wn/${iconCode}@2x.png` : '';
    const formattedSunrise = formatTime(sunrise);
    const formattedSunset = formatTime(sunset);

    return (
        <section className='weather-card' aria-label={`Current weather in ${name}`}>
            <header><h2>Current Weather In {name}</h2></header>
            <div className="weather-card-in">
                <div className='weather-card-left'>
                    {iconUrl && <img src={iconUrl} alt={description} />}
                    <p className="temperature" aria-label="Temperature">{temperature}°C</p>
                    <p className="description">{description}</p>
                </div>
                <div className='weather-card-right'>
                    <div className="details">
                        <p><b>Sunrise:</b> {formattedSunrise}</p>
                        <p><b>Sunset:</b> {formattedSunset}</p>
                        <p><b>Minimum Temperature:</b> {minTemp}°C</p>
                        <p><b>Maximum Temperature:</b> {maxTemp}°C</p>
                        <p><b>Feels like:</b> {feelsLike}°C</p>
                        <p><b>Humidity:</b> {humidity}%</p>
                        <p><b>Wind Speed:</b> {windSpeed} m/s</p>
                    </div>
                </div>
            </div>
        </section>
    );
});

WeatherDisplay.propTypes = {
    weatherData: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.string
};

export default WeatherDisplay;