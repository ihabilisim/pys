
import { useState, useEffect } from 'react';
import { WeatherData } from '../types';

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Avrig Coordinates
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.7262&longitude=24.3765&current_weather=true&windspeed_unit=kmh&timezone=auto');
                if (!res.ok) throw new Error(`Weather API Error`);
                const weatherData = await res.json();
                if (weatherData && weatherData.current_weather) {
                    setWeather({
                        temp: weatherData.current_weather.temperature,
                        wind: weatherData.current_weather.windspeed,
                        code: weatherData.current_weather.weathercode
                    });
                }
            } catch (error) {
                // Fallback / Default Weather
                setWeather({ temp: 18, wind: 12, code: 1 });
            }
        };

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 600000); // 10 minutes
        return () => clearInterval(weatherInterval);
    }, []);

    return weather;
};
