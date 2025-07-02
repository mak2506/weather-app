import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";

const ForecastItem = memo(({ forecast, index = 0 }) => {
    // Memoized date processing with error handling
    const dateInfo = useMemo(() => {
        try {
            const date = new Date(forecast.dt_txt);
            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                fullDate: date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            };
        } catch (error) {
            console.error('Error processing date:', error);
            return {
                day: 'N/A',
                date: 'N/A',
                time: 'N/A',
                fullDate: 'N/A'
            };
        }
    }, [forecast.dt_txt]);

    // Memoized weather data processing with validation
    const weatherInfo = useMemo(() => {
        try {
            const temperature = forecast.main?.temp ?? 'N/A';
            const description = forecast.weather?.[0]?.description ?? 'N/A';
            const iconCode = forecast.weather?.[0]?.icon ?? '';
            const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}.png` : '';
            const humidity = forecast.main?.humidity ?? 'N/A';
            const windSpeed = forecast.wind?.speed ?? 'N/A';
            const pressure = forecast.main?.pressure ?? 'N/A';

            return { 
                temperature, 
                description, 
                iconUrl, 
                humidity, 
                windSpeed, 
                pressure,
                iconCode 
            };
        } catch (error) {
            console.error('Error processing weather info:', error);
            return {
                temperature: 'N/A',
                description: 'N/A',
                iconUrl: '',
                humidity: 'N/A',
                windSpeed: 'N/A',
                pressure: 'N/A',
                iconCode: ''
            };
        }
    }, [forecast.main, forecast.weather, forecast.wind]);

    const { day, date, time, fullDate } = dateInfo;
    const { temperature, description, iconUrl, humidity, windSpeed, pressure } = weatherInfo;

    // Determine if this is today
    const isToday = useMemo(() => {
        try {
            const forecastDate = new Date(forecast.dt_txt);
            const today = new Date();
            return forecastDate.toDateString() === today.toDateString();
        } catch (error) {
            return false;
        }
    }, [forecast.dt_txt]);

    return (
        <div 
            className={`forecast-item ${isToday ? 'today' : ''}`}
            role="listitem"
            aria-label={`${isToday ? 'Today' : day} forecast: ${description}, ${temperature}°C`}
        >
            <header className="forecast-header">
                <h3 className="forecast-day">
                    {isToday ? 'Today' : day}
                </h3>
                <time 
                    dateTime={forecast.dt_txt}
                    className="forecast-date"
                    title={fullDate}
                >
                    {date}
                </time>
                <span className="forecast-time">{time}</span>
            </header>

            <div className="forecast-content">
                {iconUrl && (
                    <img 
                        src={iconUrl} 
                        alt={description} 
                        loading="lazy"
                        className="forecast-icon"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            console.warn('Failed to load forecast icon');
                        }}
                    />
                )}
                
                <div className="forecast-main">
                    <p className="forecast-temp" aria-label={`Temperature ${temperature} degrees Celsius`}>
                        {temperature}°C
                    </p>
                    <p className="forecast-desc" aria-label={`Weather description: ${description}`}>
                        {description}
                    </p>
                </div>

                <div className="forecast-details">
                    <div className="forecast-detail-item">
                        <span className="detail-label">Humidity:</span>
                        <span className="detail-value">{humidity}%</span>
                    </div>
                    <div className="forecast-detail-item">
                        <span className="detail-label">Wind:</span>
                        <span className="detail-value">{windSpeed} m/s</span>
                    </div>
                    <div className="forecast-detail-item">
                        <span className="detail-label">Pressure:</span>
                        <span className="detail-value">{pressure} hPa</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

ForecastItem.propTypes = {
    forecast: PropTypes.shape({
        dt: PropTypes.number.isRequired,
        dt_txt: PropTypes.string.isRequired,
        main: PropTypes.shape({
            temp: PropTypes.number,
            humidity: PropTypes.number,
            pressure: PropTypes.number,
        }),
        weather: PropTypes.arrayOf(PropTypes.shape({
            description: PropTypes.string,
            icon: PropTypes.string,
        })),
        wind: PropTypes.shape({
            speed: PropTypes.number,
        }),
    }).isRequired,
    index: PropTypes.number,
};

ForecastItem.displayName = 'ForecastItem';

export default ForecastItem;