import React from "react";
import ForecastItem from "./ForecastItem";

function WeatherForecast({forecastData}) {
    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
        return null;
    }

    const dailyForecasts = forecastData.list.filter((item, index) => {
        const date = new Date(item.dt * 1000);
        const hours = date.getHours();
        const today = new Date().toDateString;
        const itemDate = date.toDateString();

        return index % 8 === 4;
    })

    if (dailyForecasts.length === 0) {
        return <p>No detailed forecast available.</p>;
    }
    return (
        <div className="weather-forecast">
        <h3>5-Day Forecast</h3>
        <div className="forecast-list">
            {dailyForecasts.map((forecastItem) => (
            <ForecastItem key={forecastItem.dt} forecast={forecastItem} />
            ))}
        </div>
        </div>
    );
}

export default WeatherForecast;