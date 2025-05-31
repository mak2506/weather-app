import './index.css';
import React, {useState, useEffect} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import { fetchWeatherByCity } from './api/openWeatherMap';

function App() {
  // 1. State for the city the user wants to search for
  const [city, setCity] = useState('');

  // 2. State to store the fetched weather data
  const [weatherData, setWeatherData] = useState(null);

  // 3. State to indicate if data is currently being loaded
  const [isLoading, setIsLoading] = useState(false);

  // 4. State to store any error messages
  const [error, setError] = useState(null);


  useEffect(() => {
    const getWeather = async() => {
      // Don't fetch if the city is empty (e.g., on initial load or clear search)
      if (!city) {
        setWeatherData(null);
        setError(null);
        return;
      }
      setIsLoading(true);//set loading to true before fetching
      setError(null);//to set all previous errors to null
      try {
        const data = await fetchWeatherByCity(city);
        setWeatherData(data);
      } catch(err) {
      // If an error occurs, set the error state
        setError(err.message || 'Failed to fetch weather data.');
        setWeatherData(null); // Clear weather data on error
      } finally {
        setIsLoading(false);
      }
    }
    getWeather();
  }, [city]);

  // This function will be passed to the SearchBar component
    // It will update the 'city' state when a search is performed
  const handleSearch= (searchedCity) => {
    setCity(searchedCity);
    console.log(searchedCity);
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
    </div>
  );
}

export default App;
