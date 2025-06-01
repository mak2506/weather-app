import './index.css';
import React, {useState, useEffect} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import { fetchWeatherByCity, fetchForecastByCoords } from './api/openWeatherMap';
import useWeather from './hooks/useWeather';
import WeatherForecast from './components/WeatherForecast';

function App() {
  // 1. State for the city the user wants to search for
  const [cityInput, setCityInput] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');
  const {weatherData, forecastData, isLoading, error} = useWeather(submittedCity);
;
  // This function will be passed to the SearchBar component
    // It will update the 'city' state when a search is performed
  const handleSearch= (searchedCity) => {
    setSubmittedCity(searchedCity);
    setCityInput(searchedCity);
  }


  return (
    <div className="App">
      <h1>The weather app</h1>
      <SearchBar onSearch={handleSearch}/>
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
