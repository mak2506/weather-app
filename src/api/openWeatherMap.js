const API_KEY = "7736b506c4d958c2eec6b053c27b1c1a";
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeatherByCity = async(city)=> {
    try {
        const response = await fetch(
        `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Could not fetch weather data');
        }

        const data = await response.json();
        return data;
    } catch (error){
        console.log(error);
        throw error;
    }
}