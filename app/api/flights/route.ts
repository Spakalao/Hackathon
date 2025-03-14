import { NextResponse } from 'next/server';

// Set the runtime to edge for better performance
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departDate = searchParams.get('departDate');
    const returnDate = searchParams.get('returnDate');
    
    // Validate required parameters
    if (!origin || !destination || !departDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        message: 'origin, destination, and departDate are required' 
      }, { status: 400 });
    }

    // In a real implementation, you would use a flight search API like:
    // - Skyscanner API
    // - Kiwi/Tequila API (by Kiwi.com)
    // - Amadeus API
    
    // For the hackathon, we'll simulate a response with realistic data
    // This allows you to build the UI without waiting for API integration
    
    const mockFlights = generateMockFlights(origin, destination, departDate, returnDate);
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return NextResponse.json({
      success: true,
      flights: mockFlights,
      origin,
      destination,
      search_params: {
        depart_date: departDate,
        return_date: returnDate || 'one-way'
      }
    });
    
  } catch (error) {
    console.error('Error in flights API:', error);
    return NextResponse.json(
      { error: 'An error occurred during your request.' },
      { status: 500 }
    );
  }
}

// Helper function to generate realistic mock flight data
function generateMockFlights(
  origin: string, 
  destination: string, 
  departDate: string, 
  returnDate: string | null
) {
  const airlines = [
    'Budget Air', 'SkyValue', 'EconoWings', 'FlyLow', 
    'Horizon Air', 'Star Alliance', 'Oceanic'
  ];
  
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = (Math.floor(Math.random() * 12) * 5).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const getRandomDuration = () => {
    const hours = Math.floor(Math.random() * 10) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };
  
  const getRandomPrice = () => {
    // Generate budget-friendly prices between $80 and $600
    return Math.floor(Math.random() * 520) + 80;
  };

  // Generate outbound flights
  const outboundFlights = Array.from({ length: 5 }, (_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departTime = getRandomTime();
    const duration = getRandomDuration();
    
    return {
      id: `OB-${i + 1}`,
      airline,
      flight_number: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000) + 1000}`,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      depart_date: departDate,
      depart_time: departTime,
      arrival_time: getRandomTime(),
      duration,
      price: getRandomPrice(),
      currency: 'USD',
      stops: Math.random() > 0.7 ? 1 : 0,
      cabin_class: 'Economy'
    };
  }).sort((a, b) => a.price - b.price); // Sort by price (lowest first)

  // Only generate return flights if returnDate is provided
  const returnFlights = returnDate 
    ? Array.from({ length: 5 }, (_, i) => {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const departTime = getRandomTime();
        const duration = getRandomDuration();
        
        return {
          id: `RET-${i + 1}`,
          airline,
          flight_number: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000) + 1000}`,
          origin: destination.toUpperCase(),
          destination: origin.toUpperCase(),
          depart_date: returnDate,
          depart_time: departTime,
          arrival_time: getRandomTime(),
          duration,
          price: getRandomPrice(),
          currency: 'USD',
          stops: Math.random() > 0.7 ? 1 : 0,
          cabin_class: 'Economy'
        };
      }).sort((a, b) => a.price - b.price) // Sort by price (lowest first)
    : [];

  return {
    outbound: outboundFlights,
    return: returnFlights,
    // Calculate the cheapest roundtrip option
    cheapest_round_trip: returnFlights.length 
      ? {
          total_price: outboundFlights[0].price + returnFlights[0].price,
          currency: 'USD',
          outbound_flight_id: outboundFlights[0].id,
          return_flight_id: returnFlights[0].id
        }
      : null
  };
} 