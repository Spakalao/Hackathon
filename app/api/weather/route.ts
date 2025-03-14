import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the runtime to edge for better performance
export const runtime = 'edge';

// Generate dates from start to end, inclusive
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Generate realistic weather data based on location and date
function generateMockWeatherData(location: string, date: Date) {
  // Basic weather patterns based on fictional climate zones
  const locationHash = Array.from(location.toLowerCase()).reduce(
    (hash, char) => char.charCodeAt(0) + hash, 0
  );
  
  // Determine base temperature and conditions based on location "hash"
  const baseTemp = 10 + (locationHash % 25); // Base temps between 10-35°C
  const rainfall = (locationHash % 10) / 10; // 0-0.9 rainfall factor
  
  // Seasonal adjustments
  const month = date.getMonth();
  let seasonalTemp = 0;
  
  // Northern hemisphere seasonal pattern (simplified)
  if (month >= 5 && month <= 8) {
    // Summer months (June-September)
    seasonalTemp = 8;
  } else if (month >= 11 || month <= 2) {
    // Winter months (December-March)
    seasonalTemp = -8;
  } else {
    // Spring/Fall
    seasonalTemp = 0;
  }
  
  // Daily randomization
  const dayVariation = (Math.sin(date.getDate() * locationHash) + 1) * 3;
  
  // Calculate final temperatures
  const maxTemp = Math.round(baseTemp + seasonalTemp + dayVariation);
  const minTemp = Math.round(maxTemp - (5 + (Math.random() * 5)));
  const currentTemp = Math.round(minTemp + ((maxTemp - minTemp) * (0.3 + (Math.random() * 0.4))));
  
  // Determine weather condition
  let condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'partly-cloudy';
  const rainChance = Math.round((rainfall + (Math.random() * 0.5)) * 100);
  
  if (rainChance > 70) {
    condition = 'rainy';
  } else if (rainChance > 40) {
    condition = 'cloudy';
  } else if (rainChance > 20) {
    condition = 'partly-cloudy';
  } else {
    condition = 'sunny';
  }
  
  // If it's cold enough and rainy, make it snow
  if (condition === 'rainy' && maxTemp < 2) {
    condition = 'snowy';
  }
  
  // Determine weather descriptions
  const descriptions: Record<string, string[]> = {
    sunny: ['Clear skies', 'Sunny', 'Bright and sunny', 'Warm and clear'],
    'partly-cloudy': ['Partly cloudy', 'Some clouds', 'Mostly sunny'],
    cloudy: ['Overcast', 'Cloudy skies', 'Overcast conditions'],
    rainy: ['Light rain', 'Showers', 'Rainy', 'Precipitation expected'],
    snowy: ['Light snow', 'Snowfall', 'Snow showers', 'Snowy conditions'],
    stormy: ['Thunderstorms', 'Stormy conditions', 'Thunder and lightning']
  };
  
  const description = descriptions[condition][Math.floor(Math.random() * descriptions[condition].length)];
  
  // Wind speed based on condition
  let windSpeed;
  switch (condition) {
    case 'stormy':
      windSpeed = 30 + Math.round(Math.random() * 30);
      break;
    case 'rainy':
    case 'snowy':
      windSpeed = 10 + Math.round(Math.random() * 20);
      break;
    default:
      windSpeed = 5 + Math.round(Math.random() * 15);
  }
  
  // Humidity based on condition
  let humidity;
  switch (condition) {
    case 'rainy':
    case 'snowy':
    case 'stormy':
      humidity = 70 + Math.round(Math.random() * 25);
      break;
    case 'cloudy':
      humidity = 50 + Math.round(Math.random() * 30);
      break;
    default:
      humidity = 30 + Math.round(Math.random() * 30);
  }
  
  return {
    date: date.toISOString().split('T')[0],
    temperature: {
      min: minTemp,
      max: maxTemp,
      current: currentTemp
    },
    description,
    wind_speed: windSpeed,
    humidity,
    condition,
    precipitation_chance: rainChance
  };
}

export async function GET(request: NextRequest) {
  try {
    // Extract search parameters
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    // Validate required parameters
    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }
    
    // Get date range from params or default to next 7 days
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(startDate.getDate() + 6); // Default 7-day forecast
    
    // Parse custom date range if provided
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    
    if (endDateParam) {
      endDate = new Date(endDateParam);
    }
    
    // Limit forecast to 14 days maximum
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 13);
    
    if (endDate > maxEndDate) {
      endDate = maxEndDate;
    }
    
    // Generate date range
    const dateRange = generateDateRange(startDate, endDate);
    
    // Generate weather data for each date
    const forecast = dateRange.map(date => generateMockWeatherData(location, date));
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return the forecast data
    return NextResponse.json({
      location,
      forecast,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: forecast.length
      }
    });
  } catch (error) {
    console.error('Error generating weather forecast:', error);
    return NextResponse.json(
      { error: 'Failed to generate weather forecast' },
      { status: 500 }
    );
  }
} 