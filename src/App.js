import './index.css';
import React, {useState} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';

function App() {
  // 1. State for the city the user wants to search for
  const [city, setCity] = useState('');

  // 2. State to store the fetched weather data
  const [weatherData, setWeatherData] = useState(null);

  // 3. State to indicate if data is currently being loaded
  const [isLoading, setIsLoading] = useState(false);

  // 4. State to store any error messages
  const [error, setError] = useState(null);

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
