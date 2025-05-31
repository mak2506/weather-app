const API_KEY = "7736b506c4d958c2eec6b053c27b1c1a";
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeatherByCity = async(city)=> {
    try {
        const response = await fetch(
        `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'An unknown error occurred while fetching weather data.'; // Default fallback message
            if (response.status === 404) {
                // HTTP 404: City not found
                errorMessage = `City not found: "${city}". Please check the spelling.`;
            } else if (response.status === 401) {
                 // HTTP 401: Unauthorized (e.g., invalid or inactive API key)
                errorMessage = 'Authentication error: Invalid or inactive API key. Please check your OpenWeatherMap API key.';
            } else if (response.status === 500) {
                // HTTP 5xx: Server errors
                errorMessage = 'Server error: OpenWeatherMap API is currently unavailable. Please try again later.';
            } else if (errorData && errorData.message) {
                // Use the specific message provided by the API if available for other errors
                errorMessage = `API Error: ${errorData.message}`;
            } else {
                // General network/response error
                errorMessage = `Failed to fetch data. Status: ${response.status} ${response.statusText || ''}.`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error){
       console.error('Fetch Error:', error.message); // Log the specific error message
        // Re-throw a user-friendly message for network or uncaught errors
        throw new Error(error.message || 'Network connection lost or an unexpected error occurred.');
    }
}