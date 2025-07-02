import React, { useMemo } from "react";
import PropTypes from "prop-types";
import ForecastItem from "./ForecastItem";

const WeatherForecast = React.memo(function WeatherForecast({ forecastData }) {
    const dailyForecasts = useMemo(() => {
        if (!forecastData || !forecastData.list || forecastData.list.length === 0) return [];
        const dailyMap = {};
        forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const day = date.toISOString().split("T")[0];
            const hour = date.getHours();
            if (!dailyMap[day] || Math.abs(hour - 12) < Math.abs(new Date(dailyMap[day].dt * 1000).getHours() - 12)) {
                dailyMap[day] = item;
            }
        });
        return Object.values(dailyMap).slice(0, 5);
    }, [forecastData]);
    if (!dailyForecasts.length) {
        return <p>No detailed forecast available.</p>;
    }
    return (
        <section className="weather-forecast" aria-label="5-Day Weather Forecast">
            <h3>5-Day Forecast</h3>
            <div className="forecast-list">
                {dailyForecasts.map((forecastItem) => (
                    <ForecastItem key={forecastItem.dt} forecast={forecastItem} />
                ))}
            </div>
        </section>
    );
});

WeatherForecast.propTypes = {
    forecastData: PropTypes.shape({
        list: PropTypes.arrayOf(PropTypes.object)
    })
};

export default WeatherForecast;