// Weather App - Main React Component
// Handles weather data fetching, UI state management, and user interactions
import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import useWeather from './hooks/useWeather';

// Local storage key for persisting recent city searches
const LOCAL_STORAGE_KEY = 'weatherAppRecentCities';

function App() {
  // State for greeting message based on time of day
  const [greetingMessage, setGreetingMessage] = useState('');

  // Custom hook for weather data management
  const { weatherData, forecastData, isLoading, error, fetchByCity, fetchByCoords } = useWeather();

  // State for storing recent city searches with localStorage persistence
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const storedCities = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedCities ? JSON.parse(storedCities) : [];
    } catch (error) {
      console.error("Failed to parse recent cities from localStorage:", error);
      return [];
    }
  });

  // Theme state with localStorage persistence and system preference detection
  const [isDarkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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
        if (isInitial) {
          console.log("Auto-fetching weather for:", latitude, longitude);
        } else {
          console.log("Geolocation successful:", latitude, longitude);
        }
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
        console.error("Geolocation error:", geoErrorMessage);
        alert(`Geolocation Error: ${geoErrorMessage}${isInitial ? '\nWeather data cannot be displayed without location.' : ''}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchByCoords]);

  // Initialize app: set greeting message and auto-fetch weather for user's location
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12 && hour >= 5) {
      setGreetingMessage('Good Morning!');
    } else if (hour < 18) {
      setGreetingMessage('Good Afternoon!');
    } else {
      setGreetingMessage('Good Evening!');
      setDayTime(false);
      setShowStars(true);
      setDarkMode(true);
    }
    if (!weatherData && !isLoading && !error) {
      handleGeolocation(true);
    }
  }, [weatherData, isLoading, error, handleGeolocation]);

  // Persist recent cities to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentCities));
    } catch (error) {
      console.error("Failed to save recent cities to localStorage:", error);
    }
  }, [recentCities]);

  // Update recent cities list when new weather data is fetched
  useEffect(() => {
    if (weatherData && !error && !isLoading && typeof weatherData.name === 'string') {
      setRecentCities(prevCities => {
        const newCity = weatherData.name;
        const updatedCities = [newCity, ...prevCities.filter(c => c !== newCity)];
        return updatedCities.slice(0, 5); // Keep only the 5 most recent cities
      });
    }
  }, [weatherData, error, isLoading]);

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

  // Update CSS custom properties and localStorage when theme changes
  useEffect(() => {
    if (isDarkMode) {
     document.documentElement.style.setProperty('--background-grad', 'linear-gradient(to bottom,rgb(45, 46, 47),rgb(15, 15, 17))');
      localStorage.setItem('theme', 'dark');
    } else {
     document.documentElement.style.setProperty('--background-grad', 'linear-gradient(to bottom, #3253ea, #7d93f6)');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  }

  // Update cloud visibility based on weather conditions
  useEffect(() => {
    if (weatherData && weatherData.weather && weatherData.weather[0]) {
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      const conditionsWithClouds = ['clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'fog', 'haze', 'squall', 'tornado'];
      if (conditionsWithClouds.includes(weatherMain)) {
        setShowClouds(true);
      } else {
        setShowClouds(false);
      }
    } else {
      setShowClouds(false);
    }
    
  }, [weatherData]);

  return (
    <div className="App">
      {/* Theme toggle button */}
      <button onClick={toggleTheme} className="theme-toggle-button">
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      
      {/* Dynamic background elements for visual effects */}
      <div id="dynamic-elements">
        {/* Show sun during day time when no clouds */}
        {(isDayTime && !showClouds) && <div className="sun"></div>}
        
        {/* Render animated stars for night time */}
         {showStars && [...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        ></div>
                    ))
          }
          
          {/* Show moon during night time when no clouds */}
          {(!showClouds && showStars) && <div className="moon"></div>}
          
          {/* Render clouds based on weather conditions */}
       {showClouds && (
    <>
        <div id="cloud1" className="cloud">
            <span>&#9729;</span>
        </div>
        <div id="cloud2" className="cloud">
            <span>&#9729;</span>
        </div>
        <div id="cloud3" className="cloud">
            <span>&#9729;</span>
        </div>
         <div id="cloud4" className="cloud">
            <span>&#9729;</span>
        </div>
         <div id="cloud5" className="cloud">
            <span>&#9729;</span>
        </div>
    </>
)}
      </div>
      
      {/* Main content container */}
      <div className="container">
        {/* Greeting message based on time of day */}
        <h1 className="greet">{greetingMessage}</h1>
        
        {/* Search bar for city input */}
        <SearchBar onSearch={handleSearch} />

        {/* Recent cities section - only show if there are recent searches */}
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

        {/* Weather display component */}
        <WeatherDisplay
          weatherData={weatherData}
          isLoading={isLoading}
          error={error}
        />
        
        {/* Weather forecast component */}
        <WeatherForecast forecastData={forecastData} />
      </div>
    </div>
  );
}

export default App;