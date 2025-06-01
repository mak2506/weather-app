import { useState, useEffect } from "react";
import { fetchWeatherByCity, fetchForecastByCoords } from "../api/openWeatherMap";

const useWeather = (city)=> {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getWeatherAndForecast = async() => {
        if (!city) {
            setWeatherData(null);
            setError(null);
            return;
        }
            setIsLoading(true);
            setError(null);

            try {
            const currentWeatherData = await fetchWeatherByCity(city);
            setWeatherData(currentWeatherData);

            if (currentWeatherData && currentWeatherData.coord) {
                const {lat, lon} = currentWeatherData.coord;
                const forecastForFiveDays = await fetchForecastByCoords(lat, lon);
                setForecastData(forecastForFiveDays);
            } else {
                setForecastData(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch weather data.');
            setWeatherData(null);
        } finally {
            setIsLoading(false);
        }
    };
    getWeatherAndForecast();
    }, [city]);
    return {weatherData, forecastData, isLoading, error};
};

export default useWeather;