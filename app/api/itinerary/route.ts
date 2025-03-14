import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from './utils';
import { optimizeBudget } from './budget';
import { getMapData } from './maps';
import { searchFlights } from './flights';
import { searchHotels } from './hotels';
import { findActivities } from './activities';

export const runtime = 'edge';

export interface ItineraryRequest {
  destination: string;
  budget: number;
  startDate: string;
  endDate: string;
  travelers: number;
  interests: string[];
  accommodationType: string;
  transportationType: string;
  userId?: string;
}

/**
 * API endpoint for generating travel itineraries using AI and external APIs
 * POST /api/itinerary
 */
export async function POST(request: NextRequest) {
  try {
    const data: ItineraryRequest = await request.json();
    
    if (!data.destination || !data.budget || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, budget, startDate, endDate' },
        { status: 400 }
      );
    }

    // Calculate trip duration in days
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    if (tripDuration < 1) {
      return NextResponse.json(
        { error: 'Invalid date range. End date must be after start date.' },
        { status: 400 }
      );
    }
    
    // Fetch data from multiple sources in parallel
    const [flightData, hotelData, activitiesData, mapData] = await Promise.all([
      searchFlights(data.destination, data.startDate, data.endDate, data.travelers),
      searchHotels(data.destination, data.startDate, data.endDate, data.travelers, data.accommodationType),
      findActivities(data.destination, data.interests, tripDuration),
      getMapData(data.destination)
    ]);
    
    // Generate initial AI-based itinerary
    const initialItinerary = await generateItinerary({
      destination: data.destination,
      budget: data.budget,
      tripDuration,
      startDate: data.startDate,
      travelers: data.travelers,
      interests: data.interests,
      flights: flightData,
      hotels: hotelData,
      activities: activitiesData,
      mapData
    });
    
    // Optimize budget allocation
    const optimizedItinerary = await optimizeBudget(initialItinerary, data.budget);
    
    // Add metadata
    const response = {
      itinerary: optimizedItinerary,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalBudget: data.budget,
        actualCost: optimizedItinerary.totalCost,
        destination: data.destination,
        duration: `${tripDuration} days`,
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
} 