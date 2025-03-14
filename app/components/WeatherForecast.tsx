"use client";

import { useState, useEffect } from 'react';
import { 
  CloudIcon, 
  SunIcon, 
  MoonIcon, 
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ArrowsRightLeftIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

type WeatherData = {
  date: string;
  temperature: {
    min: number;
    max: number;
    current: number;
  };
  description: string;
  wind_speed: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'partly-cloudy';
  precipitation_chance: number;
};

type WeatherForecastProps = {
  destination: string;
  startDate?: string;
  endDate?: string;
  compact?: boolean;
};

export default function WeatherForecast({
  destination,
  startDate,
  endDate,
  compact = false
}: WeatherForecastProps) {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState(true); // true for Celsius, false for Fahrenheit

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!destination) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Build API URL
        let url = `/api/weather?location=${encodeURIComponent(destination)}`;
        
        if (startDate) {
          url += `&startDate=${startDate}`;
        }
        
        if (endDate) {
          url += `&endDate=${endDate}`;
        }
        
        // Fetch weather data
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Set weather data
        setForecast(data.forecast);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather forecast:', err);
        setError('Failed to load weather forecast. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [destination, startDate, endDate]);
  
  // Convert temperature between Celsius and Fahrenheit
  const convertTemperature = (celsius: number) => {
    return metric ? celsius : Math.round(celsius * 9/5 + 32);
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition: string, size = 6) => {
    switch (condition) {
      case 'sunny':
        return <SunIcon className={`h-${size} w-${size} text-yellow-500`} />;
      case 'cloudy':
        return <CloudIcon className={`h-${size} w-${size} text-gray-500`} />;
      case 'rainy':
        return <CloudArrowDownIcon className={`h-${size} w-${size} text-blue-400`} />;
      case 'snowy':
        return <CloudArrowUpIcon className={`h-${size} w-${size} text-blue-200`} />;
      case 'partly-cloudy':
        return (
          <div className="relative">
            <SunIcon className={`h-${size} w-${size} text-yellow-500`} />
            <CloudIcon className={`h-${size-1} w-${size-1} text-gray-500 absolute top-0 right-0`} />
          </div>
        );
      default:
        return <CloudIcon className={`h-${size} w-${size} text-gray-500`} />;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-4 animate-pulse flex items-center justify-center" style={{ minHeight: compact ? '120px' : '200px' }}>
        <CloudIcon className="h-8 w-8 text-gray-400 animate-bounce" />
        <p className="ml-2 text-gray-dark">Loading weather forecast...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-4">
        <p className="text-gray-dark">No weather forecast available for {destination}</p>
      </div>
    );
  }
  
  // Compact view (for small sections of UI)
  if (compact) {
    return (
      <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Weather in {destination}</h3>
          <button 
            onClick={() => setMetric(!metric)} 
            className="text-sm text-primary hover:underline"
          >
            {metric ? '°C' : '°F'} → {!metric ? '°C' : '°F'}
          </button>
        </div>
        
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {forecast.slice(0, 5).map((day, index) => (
            <div key={index} className="flex flex-col items-center min-w-[70px] bg-white dark:bg-gray-dark/20 rounded-md p-2">
              <div className="text-xs text-gray-dark mb-1">
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
              {getWeatherIcon(day.condition, 5)}
              <div className="mt-1 text-sm font-medium">
                {convertTemperature(day.temperature.max)}°{metric ? 'C' : 'F'}
              </div>
              <div className="text-xs text-gray-dark">
                {convertTemperature(day.temperature.min)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Full view
  return (
    <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Weather Forecast</h3>
          <p className="text-gray-dark">for {destination}</p>
        </div>
        
        <button 
          onClick={() => setMetric(!metric)} 
          className="mt-2 sm:mt-0 btn-outline btn-sm"
        >
          Switch to {metric ? 'Fahrenheit' : 'Celsius'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-dark/30 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="font-bold mb-2">
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long' })}
            </div>
            <div className="text-sm text-gray-dark mb-4">
              {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            
            <div className="flex justify-center mb-3">
              {getWeatherIcon(day.condition, 10)}
            </div>
            
            <div className="text-center mb-3">
              <div className="text-xl font-bold">
                {convertTemperature(day.temperature.max)}°{metric ? 'C' : 'F'}
              </div>
              <div className="text-sm text-gray-dark">
                {convertTemperature(day.temperature.min)}°{metric ? 'C' : 'F'}
              </div>
            </div>
            
            <div className="text-sm mb-1">
              {day.description}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-dark mt-3">
              <div className="flex items-center">
                <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                {day.wind_speed} km/h
              </div>
              <div className="flex items-center">
                <CloudArrowDownIcon className="h-4 w-4 mr-1" />
                {day.precipitation_chance}%
              </div>
              <div className="flex items-center">
                <BeakerIcon className="h-4 w-4 mr-1" />
                {day.humidity}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 