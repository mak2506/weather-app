import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecastByCoords } from '../api/openWeatherMap';

const useWeather = () => {
  const [searchCity, setSearchCity] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const queryClient = useQueryClient();

  // Single weather query that handles both city and location searches
  const weatherQuery = useQuery(
    ['weather', searchCity || currentLocation],
    async () => {
      if (searchCity) {
        return await fetchWeatherByCity(searchCity);
      } else if (currentLocation) {
        return await fetchWeatherByCoords(currentLocation.lat, currentLocation.lon);
      }
      throw new Error('No search criteria provided');
    },
    {
      enabled: !!(searchCity || currentLocation),
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  // Forecast query
  const forecastQuery = useQuery(
    ['forecast', weatherQuery.data?.coord],
    async () => {
      const coords = weatherQuery.data?.coord;
      if (!coords) throw new Error('No coordinates available');
      return await fetchForecastByCoords(coords.lat, coords.lon);
    },
    {
      enabled: !!weatherQuery.data?.coord,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 10 * 60 * 1000, // 10 minutes for forecast
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  // Fetch weather by city
  const fetchByCity = useCallback((city) => {
    console.log('fetchByCity called with:', city); // Debug log
    if (typeof city === 'string' && city.trim()) {
      setSearchCity(city.trim());
      setCurrentLocation(null); // Clear location-based search
    }
  }, []);

  // Fetch weather by coordinates
  const fetchByCoords = useCallback((coords) => {
    console.log('fetchByCoords called with:', coords); // Debug log
    if (coords && typeof coords === 'object' && 
        typeof coords.lat === 'number' && typeof coords.lon === 'number') {
      setCurrentLocation(coords);
      setSearchCity(''); // Clear city-based search
    }
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setSearchCity('');
    setCurrentLocation(null);
    queryClient.clear();
  }, [queryClient]);

  // Invalidate and refetch current data
  const refetchData = useCallback(() => {
    weatherQuery.refetch();
    if (forecastQuery.data) {
      forecastQuery.refetch();
    }
  }, [weatherQuery, forecastQuery]);

  return {
    weatherData: weatherQuery.data,
    forecastData: forecastQuery.data,
    isLoading: weatherQuery.isLoading || forecastQuery.isLoading,
    error: weatherQuery.error?.message || forecastQuery.error?.message || null,
    fetchByCity,
    fetchByCoords,
    clearData,
    refetchData,
    // Additional query states for more granular control
    isWeatherLoading: weatherQuery.isLoading,
    isForecastLoading: forecastQuery.isLoading,
    weatherError: weatherQuery.error?.message,
    forecastError: forecastQuery.error?.message,
  };
};

export default useWeather; 