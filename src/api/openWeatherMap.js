const API_KEY = "7736b506c4d958c2eec6b053c27b1c1a";
const BASE_URL_WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

// Generic fetch helper for OpenWeatherMap API
const fetchFromOpenWeather = async (url, errorMessages = {}) => {
  try {
    const response = await fetch(url);
    const errorData = !response.ok ? await response.json() : null;

    if (!response.ok) {
      let errorMessage = errorMessages.default || 'An unknown error occurred while fetching data.';
      if (response.status === 404 && errorMessages[404]) {
        errorMessage = errorMessages[404];
      } else if (response.status === 401 && errorMessages[401]) {
        errorMessage = errorMessages[401];
      } else if (response.status >= 500 && errorMessages[500]) {
        errorMessage = errorMessages[500];
      } else if (errorData && errorData.message) {
        errorMessage = `${errorMessages.apiPrefix || 'API Error:'} ${errorData.message}`;
      } else {
        errorMessage = `Failed to fetch data. Status: ${response.status} ${response.statusText || ''}.`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch Error:', error.message);
    throw new Error(error.message || 'Network connection lost or an unexpected error occurred.');
  }
};

export const fetchWeatherByCity = async (city) => {
  const url = `${BASE_URL_WEATHER}?q=${city}&appid=${API_KEY}&units=metric`;
  return fetchFromOpenWeather(url, {
    default: 'An unknown error occurred while fetching weather data.',
    404: `City not found: "${city}". Please check the spelling.`,
    401: 'Authentication error: Invalid or inactive API key. Please check your OpenWeatherMap API key.',
    500: 'Server error: OpenWeatherMap API is currently unavailable. Please try again later.',
    apiPrefix: 'API Error:'
  });
};

export const fetchForecastByCoords = async (lat, lon) => {
  const url = `${BASE_URL_FORECAST}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchFromOpenWeather(url, {
    default: 'An unknown error occurred while fetching forecast data.',
    401: 'Authentication error: Invalid or inactive API key for forecast. Please check your OpenWeatherMap API key.',
    500: 'Server error: OpenWeatherMap Forecast API is currently unavailable. Please try again later.',
    apiPrefix: 'API Error (Forecast):'
  });
};

export const fetchWeatherByCoords = async (lat, lon) => {
  const url = `${BASE_URL_WEATHER}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchFromOpenWeather(url, {
    default: 'An unknown error occurred while fetching current weather data by coordinates.',
    401: 'Authentication error: Invalid or inactive API key for location weather. Please check your OpenWeatherMap API key.',
    500: 'Server error: OpenWeatherMap API is currently unavailable. Please try again later.',
    apiPrefix: 'API Error (Location Weather):'
  });
};