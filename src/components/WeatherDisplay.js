import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function WeatherDisplay({weatherData, isLoading, error}) {
    if (isLoading) {
        return <LoadingSpinner/>;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

     if (!weatherData) {
        return <p>Enter a city to get weather information.</p>;
    }

    const { name, main, weather, wind } = weatherData;

    const temperature = main ? main.temp : 'N/A';
    const feelsLike = main ? main.feels_like : 'N/A';
    const humidity = main ? main.humidity : 'N/A';
    const windSpeed = wind ? wind.speed : 'N/A'; // OpenWeatherMap returns wind speed in m/s by default for units=metric

    // Get weather description and icon code
    const description = weather && weather.length > 0 ? weather[0].description : 'N/A';
    const iconCode = weather && weather.length > 0 ? weather[0].icon : '';
    const iconUrl = iconCode ? `http://openweathermap.org/img/wn/${iconCode}@2x.png` : ''; // URL for weather icon

    return (
        <div className='weather-card'>
            <h2>{name}</h2>
            {iconUrl && <img src={iconUrl} alt={description}/>}
             <p className="temperature">{temperature}°C</p> {/* Temperature */}
            <p className="description">{description}</p> {/* Weather Description */}

            <div className="details">
                <p>Feels like: {feelsLike}°C</p>
                <p>Humidity: {humidity}%</p>
                <p>Wind Speed: {windSpeed} m/s</p>
            </div>
        </div>
    );
}

export default WeatherDisplay;