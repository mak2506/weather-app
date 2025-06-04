import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecastByCoords } from '../api/openWeatherMap';

const useWeather = () => { // Removed cityOrCoords from initial arguments
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fetchTrigger, setFetchTrigger] = useState(null);

  useEffect(() => {
    const getWeatherAndForecast = async () => {
      // Clear data and errors if no valid input is provided to the trigger
      if (!fetchTrigger || (typeof fetchTrigger === 'string' && fetchTrigger.trim() === '')) {
        setWeatherData(null);
        setForecastData(null);
        setError(null);
        setIsLoading(false); // Ensure loading is off if no trigger
        return;
      }

      setIsLoading(true);
      setError(null);

      let currentWeatherData = null;

      try {
        if (typeof fetchTrigger === 'string') {
          // If trigger is a string, fetch by city name
          currentWeatherData = await fetchWeatherByCity(fetchTrigger);
        } else if (fetchTrigger && typeof fetchTrigger === 'object' && fetchTrigger.lat != null && fetchTrigger.lon != null) {
          // If trigger is an object with lat/lon, fetch by coordinates
          currentWeatherData = await fetchWeatherByCoords(fetchTrigger.lat, fetchTrigger.lon);
        } else {
          // Invalid trigger type
          throw new Error('Invalid input for weather fetching: must be a city name or {lat, lon} object.');
        }

        setWeatherData(currentWeatherData);

        if (currentWeatherData && currentWeatherData.coord) {
          const { lat, lon } = currentWeatherData.coord;
          const fiveDayForecast = await fetchForecastByCoords(lat, lon);
          setForecastData(fiveDayForecast);
        } else {
          setForecastData(null);
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch weather data.');
        setWeatherData(null);
        setForecastData(null);
      } finally {
        setIsLoading(false);
      }
    };

    getWeatherAndForecast();
  }, [fetchTrigger]);

  const fetchByCity = useCallback((city) => {
    setFetchTrigger(city);
  }, []);

  const fetchByCoords = useCallback((coords) => {
    setFetchTrigger(coords);
  }, []);

  return { weatherData, forecastData, isLoading, error, fetchByCity, fetchByCoords }; // Return new functions
};

export default useWeather;