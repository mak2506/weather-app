// Weather App - Main React Component
// Handles weather data fetching, UI state management, and user interactions
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import useWeather from './hooks/useWeather';
import LoadingSpinner from './components/LoadingSpinner';
import { testApiConnection } from './api/openWeatherMap';

// Local storage key for persisting recent city searches
const LOCAL_STORAGE_KEY = 'weatherAppRecentCities';
const THEME_STORAGE_KEY = 'theme';

// Constants for better maintainability
const MAX_RECENT_CITIES = 5;
const GEOLOCATION_OPTIONS = { 
  enableHighAccuracy: true, 
  timeout: 10000, 
  maximumAge: 5 * 60 * 1000 // 5 minutes
};
const WEATHER_CONDITIONS_WITH_CLOUDS = ['clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'fog', 'haze', 'squall', 'tornado'];

// Utility functions
const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning!';
  if (hour >= 12 && hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const isNightTime = (timezone = null) => {
  let currentTime;
  
  if (timezone) {
    // Use the city's timezone
    const utcTime = new Date();
    const cityTime = new Date(utcTime.getTime() + (timezone * 1000));
    currentTime = cityTime.getHours();
  } else {
    // Use local time as fallback
    currentTime = new Date().getHours();
  }
  
  return currentTime >= 18 || currentTime < 5;
};

const getGreetingMessageForCity = (timezone = null) => {
  let currentTime;
  
  if (timezone) {
    // Use the city's timezone
    const utcTime = new Date();
    const cityTime = new Date(utcTime.getTime() + (timezone * 1000));
    currentTime = cityTime.getHours();
  } else {
    // Use local time as fallback
    currentTime = new Date().getHours();
  }
  
  if (currentTime >= 5 && currentTime < 12) return 'Good Morning!';
  if (currentTime >= 12 && currentTime < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const getStoredRecentCities = () => {
  try {
    const storedCities = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedCities ? JSON.parse(storedCities) : [];
  } catch (error) {
    console.error("Failed to parse recent cities from localStorage:", error);
    return [];
  }
};

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error("Failed to get initial theme:", error);
    return false;
  }
};

const getInitialUserOverride = () => {
  try {
    const savedOverride = localStorage.getItem('userThemeOverride');
    return savedOverride || null;
  } catch (error) {
    console.error("Failed to get initial user override:", error);
    return null;
  }
};

const getGeolocationErrorMessage = (geoError) => {
  switch (geoError.code) {
    case geoError.PERMISSION_DENIED:
      return 'Location access denied. Please enable location services in your browser settings.';
    case geoError.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.';
    case geoError.TIMEOUT:
      return 'The request to get user location timed out.';
    default:
      return 'An unknown geolocation error occurred.';
  }
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-boundary" role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary} className="retry-button">
        Try again
      </button>
    </div>
  );
};

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="loading-fallback">
    <LoadingSpinner />
  </div>
);

function App() {
  // State for greeting message based on time of day
  const [greetingMessage, setGreetingMessage] = useState(getGreetingMessage);

  // Custom hook for weather data management
  const { weatherData, forecastData, isLoading, error, fetchByCity, fetchByCoords } = useWeather();

  // State for storing recent city searches with localStorage persistence
  const [recentCities, setRecentCities] = useState(getStoredRecentCities);

  // Theme state with localStorage persistence and system preference detection
  const [isDarkMode, setDarkMode] = useState(getInitialTheme);
  const [userThemeOverride, setUserThemeOverride] = useState(getInitialUserOverride); // null = auto, 'light' or 'dark' = user choice

  // Visual state for day/night animations
  const [isDayTime, setDayTime] = useState(!isNightTime());
  const [showStars, setShowStars] = useState(isNightTime());
  const [showClouds, setShowClouds] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Memoized values for performance
  const hasRecentCities = useMemo(() => recentCities.length > 0, [recentCities]);
  const shouldShowClouds = useMemo(() => {
    if (!weatherData?.weather?.[0]) return false;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    return WEATHER_CONDITIONS_WITH_CLOUDS.includes(weatherMain);
  }, [weatherData]);

  // Get timezone from weather data
  const cityTimezone = useMemo(() => {
    return weatherData?.timezone || null;
  }, [weatherData]);

  // Determine actual theme based on time and user preference
  const actualTheme = useMemo(() => {
    if (userThemeOverride !== null) {
      return userThemeOverride === 'dark';
    }
    const isNight = isNightTime(cityTimezone);
    return isNight; // false = light (day), true = dark (night)
  }, [userThemeOverride, cityTimezone]);

  // Geolocation handler for fetching weather by coordinates
  const handleGeolocation = useCallback((isInitial = false) => {
    if (!navigator.geolocation) {
      const message = 'Geolocation is not supported by your browser.';
      if (isInitial) {
        console.warn(`${message} Weather data cannot be displayed.`);
      }
      return;
    }

    setHasRequestedLocation(true);
    
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
        const geoErrorMessage = getGeolocationErrorMessage(geoError);
        console.error("Geolocation error:", geoErrorMessage);
        if (!isInitial) {
          // Show toast notification for user-initiated location requests
          // toast.error(`Geolocation Error: ${geoErrorMessage}`);
        }
      },
      GEOLOCATION_OPTIONS
    );
  }, [fetchByCoords]);

  // Initialize app: set greeting message and auto-fetch weather for user's location
  useEffect(() => {
    const isNight = isNightTime(cityTimezone);
    
    setGreetingMessage(getGreetingMessageForCity(cityTimezone));
    setDayTime(!isNight);
    setShowStars(isNight);
    
    // Only set dark mode automatically if no user override
    if (userThemeOverride === null && isNight) {
      // Don't automatically set dark mode - let the actualTheme handle it
    }
    
    // Request location on initial load
    if (!hasRequestedLocation) {
      handleGeolocation(true);
    }
  }, [handleGeolocation, hasRequestedLocation, cityTimezone, userThemeOverride]);

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
    if (weatherData?.name && !error && !isLoading) {
      setRecentCities(prevCities => {
        const newCity = weatherData.name;
        const updatedCities = [newCity, ...prevCities.filter(c => c !== newCity)];
        return updatedCities.slice(0, MAX_RECENT_CITIES);
      });
    }
  }, [weatherData, error, isLoading]);

  // Update CSS custom properties and localStorage when theme changes
  useEffect(() => {
    const backgroundGrad = actualTheme 
      ? 'linear-gradient(to bottom,rgb(45, 46, 47),rgb(15, 15, 17))'
      : 'linear-gradient(to bottom, #3253ea, #7d93f6)';
    
    document.documentElement.style.setProperty('--background-grad', backgroundGrad);
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, actualTheme ? 'dark' : 'light');
      localStorage.setItem('userThemeOverride', userThemeOverride);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
    }
  }, [actualTheme, userThemeOverride]);

  // Update cloud visibility based on weather conditions
  useEffect(() => {
    setShowClouds(shouldShowClouds);
  }, [shouldShowClouds]);

  // Event handlers for user interactions
  const handleSearch = useCallback((searchedCity) => {
    fetchByCity(searchedCity);
  }, [fetchByCity]);

  const handleRecentCityClick = useCallback((city) => {
    fetchByCity(city);
  }, [fetchByCity]);

  const handleClearRecentCities = useCallback(() => {
    setRecentCities([]);
  }, []);

  const toggleTheme = useCallback(() => {
    if (userThemeOverride === null) {
      // User is switching from auto to manual mode
      setUserThemeOverride(actualTheme ? 'light' : 'dark');
    } else if (userThemeOverride === 'light') {
      // User is switching from light to dark
      setUserThemeOverride('dark');
    } else {
      // User is switching from dark to auto
      setUserThemeOverride(null);
    }
  }, [userThemeOverride, actualTheme]);

  // Test API connection
  const handleTestApi = useCallback(async () => {
    console.log('Testing API connection...');
    try {
      const result = await testApiConnection();
      if (result.success) {
        console.log('API test successful:', result.data);
        alert('API connection successful! Check console for details.');
      } else {
        console.error('API test failed:', result.error);
        alert(`API test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      alert(`API test error: ${error.message}`);
    }
  }, []);

  // Memoized dynamic elements for better performance
  const dynamicElements = useMemo(() => {
    const isNight = isNightTime(cityTimezone);
    const shouldShowDayElements = !isNight && !showClouds;
    const shouldShowNightElements = isNight && !showClouds;
    
    return (
      <div id="dynamic-elements">
        {/* Show sun during day time when no clouds */}
        {shouldShowDayElements && <div className="sun" aria-hidden="true"></div>}
        
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
            aria-hidden="true"
          ></div>
        ))}
        
        {/* Show moon during night time when no clouds */}
        {shouldShowNightElements && <div className="moon" aria-hidden="true"></div>}
        
        {/* Render clouds based on weather conditions */}
        {showClouds && (
          <>
            <div id="cloud1" className="cloud" aria-hidden="true"><span>&#9729;</span></div>
            <div id="cloud2" className="cloud" aria-hidden="true"><span>&#9729;</span></div>
            <div id="cloud3" className="cloud" aria-hidden="true"><span>&#9729;</span></div>
            <div id="cloud4" className="cloud" aria-hidden="true"><span>&#9729;</span></div>
            <div id="cloud5" className="cloud" aria-hidden="true"><span>&#9729;</span></div>
          </>
        )}
      </div>
    );
  }, [cityTimezone, showClouds, showStars]);

  // Memoized recent cities section
  const recentCitiesSection = useMemo(() => {
    if (!hasRecentCities) return null;
    
    return (
      <div className="recent-cities">
        <h4>Recent Searches:</h4>
        <div className="recent-cities-list">
          {recentCities.map((city, index) => (
            <button
              key={`${city}-${index}`}
              onClick={() => handleRecentCityClick(city)}
              className="recent-city-button"
              aria-label={`Search weather for ${city}`}
            >
              {city}
            </button>
          ))}
          <button
            onClick={handleClearRecentCities}
            className="clear-history-button"
            aria-label="Clear search history"
          >
            Clear History
          </button>
        </div>
      </div>
    );
  }, [hasRecentCities, recentCities, handleRecentCityClick, handleClearRecentCities]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.reload();
      }}
    >
      <HelmetProvider>
        <div className="App">
          {/* Theme toggle button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-button"
            aria-label={`Current: ${actualTheme ? 'Dark' : 'Light'} mode. Click to ${userThemeOverride === null ? 'switch to manual' : userThemeOverride === 'light' ? 'switch to dark' : 'switch to auto'} mode`}
          >
            {userThemeOverride === null 
              ? (actualTheme ? '🌙 Auto (Night)' : '☀️ Auto (Day)')
              : (actualTheme ? '🌙 Dark Mode' : '☀️ Light Mode')
            }
          </button>
          
          {/* Test API button (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={handleTestApi} 
              className="theme-toggle-button"
              style={{ top: '80px' }}
              aria-label="Test API connection"
            >
              🧪 Test API
            </button>
          )}
          
          {/* Dynamic background elements for visual effects */}
          {dynamicElements}
          
          {/* Main content container */}
          <div className="container">
            {/* Greeting message based on time of day */}
            <h1 className="greet">{greetingMessage}</h1>
            
            {/* Search bar for city input */}
            <Suspense fallback={<LoadingFallback />}>
              <SearchBar onSearch={handleSearch} />
            </Suspense>

            {/* Recent cities section - only show if there are recent searches */}
            {recentCitiesSection}

            {/* Weather display component */}
            <Suspense fallback={<LoadingFallback />}>
              <WeatherDisplay
                weatherData={weatherData}
                isLoading={isLoading}
                error={error}
              />
            </Suspense>
            
            {/* Weather forecast component */}
            <Suspense fallback={<LoadingFallback />}>
              <WeatherForecast 
                forecastData={forecastData}
                isLoading={isLoading}
                error={error}
              />
            </Suspense>
          </div>
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: actualTheme ? '#333' : '#fff',
              color: actualTheme ? '#fff' : '#333',
            },
          }}
        />
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;