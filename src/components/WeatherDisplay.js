import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function WeatherDisplay({ weatherData, isLoading, error }) {
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

    if (!weatherData) {
        return <p>Enter a city to get weather information.</p>;
    }

    const { name, main, weather, wind, sys } = weatherData;

    const temperature = main ? main.temp : 'N/A';
    const feelsLike = main ? main.feels_like : 'N/A';
    const humidity = main ? main.humidity : 'N/A';
    const windSpeed = wind ? wind.speed : 'N/A'; // OpenWeatherMap returns wind speed in m/s by default for units=metric
    const { sunrise, sunset } = sys;
    const minTemp = main ? main.temp_min : 'N/A';
    const maxTemp = main ? main.temp_max : 'N/A';
    const formatTime = (unixTimestamp) => { // Make sure 'export' is here
    if (!unixTimestamp) return 'N/A';
    const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };


    // Get weather description and icon code
    const description = weather && weather.length > 0 ? weather[0].description : 'N/A';
    const iconCode = weather && weather.length > 0 ? weather[0].icon : '';
    const iconUrl = iconCode ? `http://openweathermap.org/img/wn/${iconCode}@2x.png` : ''; // URL for weather icon
    const formattedSunrise = formatTime(sunrise);
    const formattedSunset = formatTime(sunset);

    return (
        <div className='weather-card'>
            <h2>Current Weather In {name}</h2>
            <div className="weather-card-in">
                <div className='weather-card-left'>
                    {iconUrl && <img src={iconUrl} alt={description} />}
                    <p className="temperature">{temperature}°C</p> {/* Temperature */}
                    <p className="description">{description}</p> {/* Weather Description */}

                </div>
                <div className='weather-card-right'>
                    <div className="details">
                        <p><b>Sunrise:</b> {formattedSunrise} AM</p>
                        <p><b>Sunset:</b>{formattedSunset} PM</p>
                        <p><b>Minimum Temperature:</b> {minTemp}°C</p>
                        <p><b>Maximum Temperature:</b> {maxTemp}°C</p>
                        <p><b>Feels like:</b> {feelsLike}°C</p>
                        <p><b>Humidity:</b> {humidity}%</p>
                        <p><b>Wind Speed:</b> {windSpeed} m/s</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WeatherDisplay;