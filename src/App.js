import './index.css';
import React, {useState, useEffect} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import { fetchWeatherByCity, fetchForecastByCoords } from './api/openWeatherMap';
import useWeather from './hooks/useWeather';
import WeatherForecast from './components/WeatherForecast';

//key to store store data in local storage
const LOCAL_STORAGE_FOR_RECENT_CITIES = 'recentCitiesSearched';

function App() {
  // 1. State for the city the user wants to search for
  const [cityInput, setCityInput] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');
  const {weatherData, forecastData, isLoading, error} = useWeather(submittedCity);

  const [recentCities, setRecentCities] = useState(() => {
    try {
      const storedCities = localStorage.getItem(LOCAL_STORAGE_FOR_RECENT_CITIES);
      return storedCities ? JSON.parse(storedCities) : [];
    } catch (error) {
      console.error('Failed to parse local storage recent cities', error);
      return [];
    }
  });


  useEffect(() =>{
    try {
      localStorage.setItem(LOCAL_STORAGE_FOR_RECENT_CITIES, JSON.stringify(recentCities));
    } catch(error){
      console.error('Failed to save recent cities in local storage: ', error);
    }
  }, [recentCities]);

  useEffect(() => {
    if (weatherData && !error && !isLoading && submittedCity) {
      setRecentCities(prevCities => {
        const newCity = weatherData.name;
        const updatedCity = [newCity, ...prevCities.filter(c => c!== newCity)];
        return updatedCity.slice(0, 5);//to show only recent 5 cities
      })
    }
  }, [weatherData, error, isLoading, submittedCity]);

  // This function will be passed to the SearchBar component
    // It will update the 'city' state when a search is performed
  const handleSearch= (searchedCity) => {
    setSubmittedCity(searchedCity);
    setCityInput(searchedCity);
  }

  const handleRecentCityClick = (city) => {
    setSubmittedCity(city);
    setCityInput(city);
  };

  const clearRecentCities = ()=> {
    setRecentCities([]);
  };


  return (
    <div className="App">
      <h1>The weather app</h1>
      <SearchBar onSearch={handleSearch}/>
 {/* 6. Display recent cities here */}
      {recentCities.length > 0 && (
        <div className="recent-cities">
          <h4>Recent Searches:</h4>
          <div className="recent-cities-list">
            {recentCities.map((city, index) => (
              <button
                key={index} // Using index as key is okay for static lists; prefer unique IDs for dynamic ones
                onClick={() => handleRecentCityClick(city)}
                className="recent-city-button"
              >
                {city}
              </button>
            ))}
            <button
              onClick={clearRecentCities}
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
      <WeatherForecast
      forecastData={forecastData}
      />
    </div>
  );
}

export default App;
