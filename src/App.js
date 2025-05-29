import './index.css';
import React, {useState} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';

function App() {
  return (
    <div className="App">
      <h1>The weather app</h1>
      <SearchBar/>
      <WeatherDisplay/>
    </div>
  );
}

export default App;
