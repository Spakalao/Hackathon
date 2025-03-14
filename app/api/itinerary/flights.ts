/**
 * Interface for flight data
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  layovers?: {
    airport: string;
    duration: string;
  }[];
}

/**
 * Search for flights based on user preferences
 */
export async function searchFlights(
  destination: string,
  departDate: string,
  returnDate: string,
  passengers: number
): Promise<Flight[]> {
  try {
    // In a real app, this would call an external flight API like Amadeus or Skyscanner
    // For the hackathon, we'll generate realistic flight data
    
    // Determine origin city (in a real app, this would be based on user's location)
    const originCity = 'New York';
    const originAirport = 'JFK';
    
    // Parse the destination to extract city name
    const destinationCity = destination.split(',')[0].trim();
    
    // Generate a pseudo-random but deterministic airport code for the destination
    const destinationAirport = generateAirportCode(destinationCity);
    
    // Parse dates
    const departureDate = new Date(departDate);
    const returnDepartureDate = new Date(returnDate);
    
    // Generate outbound flights
    const outboundFlights = generateFlights(
      originCity, 
      originAirport, 
      destinationCity, 
      destinationAirport, 
      departureDate,
      passengers
    );
    
    // Generate return flights
    const returnFlights = generateFlights(
      destinationCity, 
      destinationAirport, 
      originCity, 
      originAirport, 
      returnDepartureDate,
      passengers
    );
    
    // Combine outbound and return flights
    return [...outboundFlights, ...returnFlights];
  } catch (error) {
    console.error('Error searching flights:', error);
    return []; // Return empty array instead of throwing to avoid breaking the entire request
  }
}

/**
 * Generate realistic flight data
 */
function generateFlights(
  originCity: string,
  originAirport: string,
  destinationCity: string,
  destinationAirport: string,
  departureDate: Date,
  passengers: number
): Flight[] {
  const flights: Flight[] = [];
  const airlines = [
    'Delta Airlines',
    'United Airlines',
    'American Airlines',
    'British Airways',
    'Lufthansa',
    'Air France',
    'Emirates',
    'Singapore Airlines',
    'Qatar Airways',
    'Turkish Airlines'
  ];
  
  // Generate a deterministic but varied seed based on the flight details
  const seed = hashString(`${originCity}-${destinationCity}-${departureDate.toISOString()}`);
  
  // Number of flights to generate (between 3 and 7)
  const numFlights = 3 + (seed % 5);
  
  for (let i = 0; i < numFlights; i++) {
    // Select airline based on the seed and index
    const airlineIndex = (seed + i) % airlines.length;
    const airline = airlines[airlineIndex];
    
    // Generate a flight number
    const flightNumber = `${airline.substring(0, 2).toUpperCase()}${100 + (seed + i) % 900}`;
    
    // Generate departure time (between 6 AM and 10 PM)
    const departureHour = 6 + ((seed + i * 3) % 16);
    const departureMinute = ((seed + i * 7) % 12) * 5; // 0, 5, 10, ..., 55
    const departureDateWithTime = new Date(departureDate);
    departureDateWithTime.setHours(departureHour, departureMinute, 0);
    
    // Generate flight duration (between 2 and 14 hours depending on destination)
    const baseDuration = calculateFlightDuration(originCity, destinationCity);
    const durationVariance = ((seed + i) % 5) - 2; // -2 to +2 hours
    const durationHours = Math.max(1, baseDuration + durationVariance);
    const durationMinutes = ((seed + i * 13) % 12) * 5; // 0, 5, 10, ..., 55
    
    // Calculate arrival time
    const arrivalDateWithTime = new Date(departureDateWithTime);
    arrivalDateWithTime.setTime(
      departureDateWithTime.getTime() + 
      (durationHours * 60 * 60 * 1000) + 
      (durationMinutes * 60 * 1000)
    );
    
    // Format duration
    const durationFormatted = `${durationHours}h ${durationMinutes}m`;
    
    // Generate price (base price with some variability)
    const basePrice = calculateBaseFlightPrice(originCity, destinationCity, durationHours);
    const priceMultiplier = 0.85 + ((seed + i * 17) % 30) / 100; // 0.85 to 1.15
    const price = Math.round(basePrice * priceMultiplier * passengers);
    
    // Determine number of stops (0, 1, or 2)
    const stops = i === 0 ? 0 : Math.min(2, (seed + i) % 3);
    
    // Generate layover information if there are stops
    const layovers = [];
    if (stops > 0) {
      const layoverAirports = getLayoverAirports(originCity, destinationCity, stops, seed + i);
      
      for (let j = 0; j < stops; j++) {
        // Layover duration between 45 minutes and 3 hours
        const layoverMinutes = 45 + ((seed + i * j) % 135);
        layovers.push({
          airport: layoverAirports[j],
          duration: `${Math.floor(layoverMinutes / 60)}h ${layoverMinutes % 60}m`
        });
      }
    }
    
    // Determine cabin class (economy by default, but could be premium or business)
    const cabinClass = i === 0 ? 'Business' : (i === 1 ? 'Premium Economy' : 'Economy');
    
    flights.push({
      id: `flight-${originAirport}-${destinationAirport}-${i}`,
      airline,
      flightNumber,
      departureAirport: originAirport,
      departureCity: originCity,
      arrivalAirport: destinationAirport,
      arrivalCity: destinationCity,
      departureTime: departureDateWithTime.toISOString(),
      arrivalTime: arrivalDateWithTime.toISOString(),
      duration: durationFormatted,
      stops,
      price,
      currency: 'USD',
      cabinClass,
      layovers: stops > 0 ? layovers : undefined
    });
  }
  
  // Sort by price by default
  return flights.sort((a, b) => a.price - b.price);
}

/**
 * Calculate a realistic flight duration between two cities
 */
function calculateFlightDuration(origin: string, destination: string): number {
  // In a real app, this would be based on actual flight times
  // Here we'll use a rough approximation based on a hash of the cities
  const cityPairHash = hashString(`${origin}-${destination}`);
  
  // Domestic flights: 1-5 hours, International: 3-14 hours
  return (cityPairHash % 12) + 3;
}

/**
 * Calculate a base price for a flight between two cities
 */
function calculateBaseFlightPrice(origin: string, destination: string, duration: number): number {
  // In a real app, this would be based on actual pricing data
  // Here we'll create a reasonable approximation
  const cityPairHash = hashString(`${origin}-${destination}`);
  const basePrice = 150 + (duration * 70); // Longer flights cost more
  const priceVariability = (cityPairHash % 60) - 30; // -30 to +30
  
  return basePrice + priceVariability;
}

/**
 * Generate a realistic airport code for a city
 */
function generateAirportCode(city: string): string {
  // In a real app, this would be based on actual airport codes
  // Here we'll generate a pseudo-random but deterministic code
  const cityHash = hashString(city);
  
  let code = '';
  code += city.charAt(0).toUpperCase();
  code += city.charAt(Math.min(1, city.length - 1)).toUpperCase();
  code += city.charAt(Math.min(2, city.length - 1)).toUpperCase();
  
  // If the city name is too short, add a character based on the hash
  if (city.length < 3) {
    const extraChar = String.fromCharCode(65 + (cityHash % 26));
    code += extraChar;
  }
  
  return code;
}

/**
 * Get realistic layover airports for a flight route
 */
function getLayoverAirports(origin: string, destination: string, numStops: number, seed: number): string[] {
  // Common hub airports that might appear as layovers
  const hubs = [
    'ATL', 'ORD', 'DFW', 'DEN', 'LAX',  // US hubs
    'LHR', 'CDG', 'AMS', 'FRA', 'MAD',  // European hubs
    'DXB', 'DOH', 'AUH',                // Middle East hubs
    'HKG', 'SIN', 'ICN', 'NRT', 'PEK'   // Asian hubs
  ];
  
  const layovers: string[] = [];
  
  for (let i = 0; i < numStops; i++) {
    const hubIndex = (seed + i * 7) % hubs.length;
    layovers.push(hubs[hubIndex]);
  }
  
  return layovers;
}

/**
 * Generate a simple hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
} 