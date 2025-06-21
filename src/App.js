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
  const [greetingMessage, setGreetingMessage] = useState('');

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

  const [isDarkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isDayTime, setDayTime] = useState(true);
  const [showStars, canShowStars] = useState(false);

  const [showClouds, canShowClouds] = useState(false);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12 && hour >= 5) {
      setGreetingMessage('Good Morning!');
    } else if (hour < 18) {
      setGreetingMessage('Good Afternoon!');
    } else {
      setGreetingMessage('Good Evening!');
      setDayTime(false);
      canShowStars(true);
      setDarkMode(true);
    }
    if (!weatherData && !isLoading && !error) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Auto-fetching weather for:", latitude, longitude);
            fetchByCoords({ lat: latitude, lon: longitude });
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
            console.warn("Geolocation error:", geoErrorMessage);
            // ONLY display the alert, DO NOT fetch for a default city
            alert(`Geolocation Error: ${geoErrorMessage}\nWeather data cannot be displayed without location.`);
            // You might want to clear any existing weatherData here if relevant
            // setWeatherData(null); // If you have a setter for weatherData state
            // setError(geoErrorMessage); // If you want to show this error in your app UI
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        // Browser does not support Geolocation
        alert('Geolocation is not supported by your browser. Weather data cannot be displayed.');
        // DO NOT fetch for a default city
        // setWeatherData(null);
        // setError('Geolocation not supported by your browser.');
      }
    }
  }, []);

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

  const mainSectionClasses = [
    'main-weather-content-section',
    isDarkMode ? 'night' : 'day', // Base day/night visual based on theme toggle
  ];

  useEffect(() => {
    if (weatherData && weatherData.weather && weatherData.weather[0]) {
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      // Define conditions for showing clouds
      const conditionsWithClouds = ['clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'fog', 'haze', 'squall', 'tornado'];
      if (conditionsWithClouds.includes(weatherMain)) {
        canShowClouds(true); // Set state to true if cloudy
      } else {
        canShowClouds(false); // Set state to false otherwise
      }
    } else {
      canShowClouds(false); // If no weather data, no clouds
    }
    
  }, [weatherData]);

  return (
    <div className="App">
      {/* <button className="mode-toggle" id="themeMode">Toggle Mode</button> */}
      <button onClick={toggleTheme} className="theme-toggle-button">
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      <div id="dynamic-elements">
        {/* {isDarkMode && } */}
        {(isDayTime && !showClouds) && <div className="sun"></div>}
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
          {(!showClouds && showStars) && <div className="moon"></div>}
       {showClouds && (
    <>
        <div id="cloud1" className="cloud">
            <span>&#9729;</span> {/* You can put the emoji directly in the div or keep span */}
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
        {/* Add more as needed */}
    </>
)}
      </div>
      <div className="container">
        <h1 className="greet">{greetingMessage}</h1>
        <SearchBar onSearch={handleSearch} />

        {/* GEOLOCATION BUTTON */}
        {/* <button
        onClick={handleGetLocationWeather}
        className="get-location-button"
        disabled={isLoading} // Disable while useWeather is loading
      >
        {isLoading ? 'Getting Weather...' : 'Get My Location Weather'}
      </button> */}

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
    </div>
  );
}

export default App;