import React from "react";

function ForecastItem ({forecast}) {
    const date =  new Date(forecast.dt_txt);
    const day = date.toLocaleDateString('en-US', {weekday: 'short'});
    const time = date.toLocaleDateString('en-US', {hour: '2-digit', minute: '2-digit'});

    const temperature = forecast.main?.temp ?? 'NA';
    const description = forecast.weather[0]?.description ?? 'NA';
    const iconCode = forecast.weather[0]?.icon ?? '';
    const iconUrl = iconCode ? `http://openweathermap.org/img/wn/${iconCode}.png` : '';

    return (
        <div className="forecast-item">
            <h3>{day} {time}</h3>
             {iconUrl && <img src={iconUrl} alt={description} />}
             <p className="forecast-temp">{temperature}°C</p>
             <p className="forecast-desc">{description}</p>
        </div>
    );
}

export default ForecastItem;