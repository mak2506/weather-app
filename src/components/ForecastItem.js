import React from "react";
import PropTypes from "prop-types";

const ForecastItem = React.memo(function ForecastItem({ forecast }) {
    if (!forecast || !forecast.dt_txt || !forecast.main || !forecast.weather || !forecast.weather[0]) {
        return (
            <article className="forecast-item forecast-item--empty fade-in" aria-label="Forecast data unavailable">
                <h3>Data unavailable</h3>
                <p className="forecast-temp">--°C</p>
                <p className="forecast-desc">No data</p>
            </article>
        );
    }

    const { dt_txt, main, weather } = forecast;
    const date = new Date(dt_txt);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const temperature = main.temp ?? 'NA';
    const description = weather[0].description ?? 'NA';
    const iconCode = weather[0].icon ?? '';
    const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}.png` : '';

    return (
        <article className="forecast-item fade-in" aria-label={`Forecast for ${day} at ${time}`}>
            <h3>{day} {time}</h3>
            {iconUrl && (
                <img 
                    src={iconUrl} 
                    alt={`Weather icon: ${description}`} 
                    title={description}
                    loading="lazy"
                />
            )}
            <p className="forecast-temp">{temperature}°C</p>
            <p className="forecast-desc">{description}</p>
        </article>
    );
});

ForecastItem.propTypes = {
    forecast: PropTypes.shape({
        dt_txt: PropTypes.string,
        main: PropTypes.shape({
            temp: PropTypes.number
        }),
        weather: PropTypes.arrayOf(
            PropTypes.shape({
                description: PropTypes.string,
                icon: PropTypes.string
            })
        )
    })
};

export default ForecastItem;