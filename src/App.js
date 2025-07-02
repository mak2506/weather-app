// Weather App - Main React Component
// Handles weather data fetching, UI state management, and user interactions
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import useWeather from './hooks/useWeather';
import useTheme from './hooks/useTheme';
import useLocalStorage from './hooks/useLocalStorage';

// Local storage key for persisting recent city searches
const LOCAL_STORAGE_KEY = 'weatherAppRecentCities';

function App() {
  // State for greeting message based on time of day
  const greetingMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12 && hour >= 5) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  }, []);

  // Custom hook for weather data management
  const { weatherData, forecastData, isLoading, error, fetchByCity, fetchByCoords } = useWeather();

  // Use custom localStorage hook for recent cities
  const [recentCities, setRecentCities] = useLocalStorage(LOCAL_STORAGE_KEY, []);

  // Use custom theme hook
  const { isDarkMode, toggleTheme } = useTheme();

  // Visual state for day/night animations
  const [isDayTime, setDayTime] = useState(true);
  const [showStars, setShowStars] = useState(false);
  const [showClouds, setShowClouds] = useState(false);

  // Geolocation handler for fetching weather by coordinates
  // isInitial: true for auto-fetch on app load, false for manual location button
  const handleGeolocation = useCallback((isInitial = false) => {
    if (!navigator.geolocation) {
      const message = 'Geolocation is not supported by your browser.';
      alert(isInitial ? `${message} Weather data cannot be displayed.` : message);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchByCoords({ lat: latitude, lon: longitude });
      },
      (geoError) => {
        let geoErrorMessage;
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
        alert(`Geolocation Error: ${geoErrorMessage}${isInitial ? '\nWeather data cannot be displayed without location.' : ''}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchByCoords]);

  // Initialize app: set greeting message and auto-fetch weather for user's location
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) {
      setDayTime(false);
      setShowStars(true);
    } else {
      setDayTime(true);
      setShowStars(false);
    }
    if (!weatherData && !isLoading && !error) {
      handleGeolocation(true);
    }
  }, [weatherData, isLoading, error, handleGeolocation]);

  // Update recent cities list when new weather data is fetched
  useEffect(() => {
    if (weatherData && !error && !isLoading && typeof weatherData.name === 'string') {
      setRecentCities(prevCities => {
        const newCity = weatherData.name;
        const updatedCities = [newCity, ...prevCities.filter(c => c !== newCity)];
        return updatedCities.slice(0, 5); // Keep only the 5 most recent cities
      });
    }
  }, [weatherData, error, isLoading, setRecentCities]);

  // Event handlers for user interactions
  const handleSearch = (searchedCity) => {
    fetchByCity(searchedCity);
  };

  const handleRecentCityClick = (city) => {
    fetchByCity(city);
  };

  const handleClearRecentCities = () => {
    setRecentCities([]);
  };

  // Update cloud visibility based on weather conditions
  useEffect(() => {
    if (weatherData && weatherData.weather && weatherData.weather[0]) {
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      const conditionsWithClouds = ['clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'fog', 'haze', 'squall', 'tornado'];
      setShowClouds(conditionsWithClouds.includes(weatherMain));
    } else {
      setShowClouds(false);
    }
  }, [weatherData]);

  // Accessibility: focus management for theme toggle
  const themeToggleRef = React.useRef();

  return (
    <div className="App">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle-button"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        ref={themeToggleRef}
        tabIndex={0}
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      {/* Dynamic background elements for visual effects */}
      <div id="dynamic-elements">
        {/* Show sun during day time and clear weather */}
        {(isDayTime && !showClouds) && (
          <div className="sun fade-in" aria-hidden="true"></div>
        )}
        {/* Render animated stars for night time */}
        {showStars && !showClouds && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="star fade-in"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
            aria-hidden="true"
          ></div>
        ))}
        {/* Show moon during night time and clear weather */}
        {(!showClouds && showStars) && (
          <div className="moon fade-in" aria-hidden="true"></div>
        )}
        {/* Render clouds based on weather conditions */}
        {showClouds && (
          <>
            {[1,2,3,4,5].map(n => (
              <div key={n} id={`cloud${n}`} className="cloud fade-in" aria-hidden="true">
                <span role="img" aria-label="cloud">&#9729;</span>
              </div>
            ))}
            {/* If night and clouds, show stars behind clouds */}
            {showStars && [...Array(10)].map((_, i) => (
              <div
                key={i}
                className="star fade-in"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  zIndex: 0
                }}
                aria-hidden="true"
              ></div>
            ))}
          </>
        )}
      </div>
      {/* Main content (no outer container) */}
      <h1 className="greet">{greetingMessage}</h1>
      <SearchBar onSearch={handleSearch} />
      {recentCities.length > 0 && (
        <div className="recent-cities">
          <h4>Recent Searches:</h4>
          <div className="recent-cities-list">
            {recentCities.map((city, index) => (
              <button
                key={index}
                onClick={() => handleRecentCityClick(city)}
                className="recent-city-button"
                aria-label={`Search weather for ${city}`}
                tabIndex={0}
              >
                {city}
              </button>
            ))}
            <button
              onClick={handleClearRecentCities}
              className="clear-history-button"
              aria-label="Clear recent search history"
              tabIndex={0}
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
      {/* Enhanced error message display */}
      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button onClick={() => handleGeolocation(false)} aria-label="Retry fetching weather">Retry</button>
        </div>
      )}
    </div>
  );
}

export default App;