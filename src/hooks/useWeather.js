import { useState, useEffect } from "react";
import { fetchWeatherByCity } from "../api/openWeatherMap";

const useWeather = (city)=> {
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const getWeather = async()=> {
        if (!city) {
            setWeatherData(null);
            setError(null);
            return;
        }
            setIsLoading(true);
            setError(null);

            try {
            const data = await fetchWeatherByCity(city);
            setWeatherData(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch weather data.');
            setWeatherData(null);
        } finally {
            setIsLoading(false);
        }
    };
    getWeather();
    }, [city]);
    return {weatherData, isLoading, error};
};

export default useWeather;