// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import useWeather from './hooks/useWeather';

const LOCAL_STORAGE_KEY = 'weatherAppRecentCities';

function App() {
  const [cityInput, setCityInput] = useState('');

  // Get data, loading, error, AND the new fetch functions from useWeather
  const { weatherData, forecastData, isLoading, error, fetchByCity, fetchByCoords } = useWeather();

  const [recentCities, setRecentCities] = useState(() => {
    try {
      const storedCities = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedCities ? JSON.parse(storedCities) : [];
    } catch (error) {
      console.error("Failed to parse recent cities from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentCities));
    } catch (error) {
      console.error("Failed to save recent cities to localStorage:", error);
    }
  }, [recentCities]);

  useEffect(() => {
    if (weatherData && !error && !isLoading && typeof weatherData.name === 'string') {
      setRecentCities(prevCities => {
        const newCity = weatherData.name;
        const updatedCities = [newCity, ...prevCities.filter(c => c !== newCity)];
        return updatedCities.slice(0, 5);
      });
    }
  }, [weatherData, error, isLoading]);

  // Handle city search (user types in search bar)
  const handleSearch = (searchedCity) => {
    fetchByCity(searchedCity);
    setCityInput(searchedCity);
  };

  // Handle clicking on a recent city
  const handleRecentCityClick = (city) => {
    fetchByCity(city);
    setCityInput(city);
  };

  // Handle clearing recent cities
  const handleClearRecentCities = () => {
    setRecentCities([]);
  };

  // --- GEOLOCATION HANDLER ---
  const handleGetLocationWeather = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Geolocation successful:", latitude, longitude);
          fetchByCoords({ lat: latitude, lon: longitude });
          setCityInput(''); // Clear search bar
        },
        (geoError) => {
          let geoErrorMessage = 'Unable to retrieve your location.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              geoErrorMessage = 'Location access denied. Please enable location services in your browser settings.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              geoErrorMessage = 'Location information is unavailable.';
              break;
            case geoError.TIMEOUT:
              geoErrorMessage = 'The request to get user location timed out.';
              break;
            default:
              geoErrorMessage = 'An unknown geolocation error occurred.';
          }
          console.error("Geolocation error:", geoErrorMessage);
          alert(`Geolocation Error: ${geoErrorMessage}`); // Temporary display
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser.'); // Temporary display
    }
  }, [fetchByCoords, setCityInput]); // Dependencies for useCallback

  return (
    <div className="App">
      <h1>My Weather App</h1>
      <SearchBar onSearch={handleSearch} />

      {/* GEOLOCATION BUTTON */}
      <button
        onClick={handleGetLocationWeather}
        className="get-location-button"
        disabled={isLoading} // Disable while useWeather is loading
      >
        {isLoading ? 'Getting Weather...' : 'Get My Location Weather'}
      </button>

      {/* Existing Recent Cities Display */}
      {recentCities.length > 0 && (
        <div className="recent-cities">
          <h4>Recent Searches:</h4>
          <div className="recent-cities-list">
            {recentCities.map((city, index) => (
              <button
                key={index}
                onClick={() => handleRecentCityClick(city)}
                className="recent-city-button"
              >
                {city}
              </button>
            ))}
            <button
              onClick={handleClearRecentCities}
              className="clear-history-button"
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      <WeatherDisplay
        weatherData={weatherData}
        isLoading={isLoading}
        error={error}
      />
      <WeatherForecast forecastData={forecastData} />
    </div>
  );
}

export default App;