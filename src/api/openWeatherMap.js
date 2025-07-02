// Environment variable for API key (should be set in .env file)
const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "7736b506c4d958c2eec6b053c27b1c1a";
const BASE_URL_WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

// CORS proxy for development
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const cache = new Map();

// Rate limiting
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCacheKey = (url) => {
  return `weather_cache_${btoa(url)}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const rateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
};

const createRequestUrl = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

const handleApiError = (response, context) => {
  let errorMessage = 'An unknown error occurred while fetching weather data.';
  
  switch (response.status) {
    case 400:
      errorMessage = 'Invalid request. Please check your input.';
      break;
    case 401:
      errorMessage = 'Authentication error: Invalid or inactive API key. Please check your OpenWeatherMap API key.';
      break;
    case 404:
      errorMessage = context === 'city' ? 'City not found. Please check the spelling.' : 'Location not found.';
      break;
    case 429:
      errorMessage = 'Too many requests. Please wait a moment before trying again.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      errorMessage = 'Server error: OpenWeatherMap API is currently unavailable. Please try again later.';
      break;
    default:
      if (response.status >= 500) {
        errorMessage = 'Server error: Please try again later.';
      } else if (response.status >= 400) {
        errorMessage = 'Request error: Please check your input and try again.';
      }
  }
  
  return new Error(errorMessage);
};

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}: Fetching from ${url}`); // Debug log
      
      // Use CORS proxy in development
      const fetchUrl = process.env.NODE_ENV === 'development' 
        ? `${CORS_PROXY}${encodeURIComponent(url)}`
        : url;
      
      console.log(`Using URL: ${fetchUrl}`); // Debug log
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log(`Response status: ${response.status}`); // Debug log
      
      if (!response.ok) {
        throw handleApiError(response, options.context);
      }
      
      const data = await response.json();
      console.log('Response data received:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message); // Debug log
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await delay(Math.pow(2, i) * 1000);
    }
  }
};

export const fetchWeatherByCity = async (city) => {
  console.log('fetchWeatherByCity called with:', city); // Debug log
  
  if (!city || typeof city !== 'string' || city.trim() === '') {
    throw new Error('City name is required and must be a non-empty string.');
  }

  const trimmedCity = city.trim();
  const params = {
    q: trimmedCity,
    appid: API_KEY,
    units: 'metric'
  };
  
  const url = createRequestUrl(BASE_URL_WEATHER, params);
  console.log('Weather API URL:', url); // Debug log
  
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log('Returning cached weather data for:', trimmedCity); // Debug log
    return cachedData;
  }
  
  try {
    await rateLimit();
    
    console.log('Making API call for weather data...'); // Debug log
    const data = await fetchWithRetry(url, { context: 'city' });
    console.log('Weather API response:', data); // Debug log
    
    // Cache the successful response
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Fetch Error (City):', error.message);
    throw error;
  }
};

export const fetchForecastByCoords = async (lat, lon) => {
  if (typeof lat !== 'number' || typeof lon !== 'number' || 
      isNaN(lat) || isNaN(lon) || 
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error('Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.');
  }

  const params = {
    lat: lat.toString(),
    lon: lon.toString(),
    appid: API_KEY,
    units: 'metric'
  };
  
  const url = createRequestUrl(BASE_URL_FORECAST, params);
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    await rateLimit();
    
    const data = await fetchWithRetry(url, { context: 'forecast' });
    
    // Cache the successful response
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Fetch Error (Forecast):', error.message);
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat, lon) => {
  if (typeof lat !== 'number' || typeof lon !== 'number' || 
      isNaN(lat) || isNaN(lon) || 
      lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error('Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.');
  }

  const params = {
    lat: lat.toString(),
    lon: lon.toString(),
    appid: API_KEY,
    units: 'metric'
  };
  
  const url = createRequestUrl(BASE_URL_WEATHER, params);
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    await rateLimit();
    
    const data = await fetchWithRetry(url, { context: 'location' });
    
    // Cache the successful response
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Fetch Error (Location Weather):', error.message);
    throw error;
  }
};

// Utility function to clear cache
export const clearCache = () => {
  cache.clear();
};

// Utility function to get cache statistics
export const getCacheStats = () => {
  const now = Date.now();
  const validEntries = Array.from(cache.entries()).filter(([_, value]) => 
    isCacheValid(value.timestamp)
  );
  
  return {
    totalEntries: cache.size,
    validEntries: validEntries.length,
    expiredEntries: cache.size - validEntries.length
  };
};

// Test function to verify API connectivity
export const testApiConnection = async () => {
  const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric`;
  
  console.log('Testing API connection with URL:', testUrl);
  
  try {
    // Use CORS proxy in development
    const fetchUrl = process.env.NODE_ENV === 'development' 
      ? `${CORS_PROXY}${encodeURIComponent(testUrl)}`
      : testUrl;
    
    console.log('Using test URL:', fetchUrl);
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Test response status:', response.status);
    console.log('Test response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Test API response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('Test API error:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('Test API connection failed:', error);
    return { success: false, error: error.message };
  }
};