import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Sample user data (in a real app, this would be in a database)
const SAMPLE_USERS = {
  '1': {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    savedTrips: [
      {
        id: 'trip-1',
        destination: 'Paris, France',
        startDate: '2023-06-15',
        endDate: '2023-06-22',
        budget: 1500,
        notes: 'Summer vacation with family',
        createdAt: '2023-03-10T00:00:00.000Z',
        itinerary: {
          destination: 'Paris, France',
          totalCost: '$1,450',
          duration: '7 days',
          days: [
            {
              date: '2023-06-15',
              activities: [
                {
                  name: 'Eiffel Tower Visit',
                  description: 'Visit the iconic Eiffel Tower',
                  cost: '$25',
                  type: 'Sightseeing',
                  location: 'Champ de Mars',
                  duration: '3 hours'
                }
              ],
              accommodation: {
                name: 'Comfort Hotel',
                location: 'Montmartre',
                cost: '$120'
              },
              transportation: {
                type: 'Metro',
                details: 'Day pass',
                cost: '$10'
              }
            }
            // More days would be here in a real app
          ],
          travelTips: [
            'Learn basic French phrases',
            'Visit museums on first Sunday for free entry',
            'Buy metro tickets in bulk to save money'
          ]
        }
      },
      {
        id: 'trip-2',
        destination: 'Tokyo, Japan',
        startDate: '2024-04-10',
        endDate: '2024-04-20',
        budget: 2500,
        notes: 'Cherry blossom season trip',
        createdAt: '2023-09-15T00:00:00.000Z',
        itinerary: null // This trip doesn't have a generated itinerary yet
      }
    ]
  },
  '2': {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    savedTrips: []
  }
};

// Function to extract user ID from authorization header
function getUserIdFromAuth(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // In a real app, this would validate the JWT token
  // For the hackathon, we'll just extract the user ID from the token
  const token = authHeader.split(' ')[1];
  const match = token.match(/fake-jwt-token-([^-]+)/);
  
  return match ? match[1] : null;
}

// GET user's saved trips
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth header
    const userId = getUserIdFromAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find user by ID
    const user = SAMPLE_USERS[userId];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ trips: user.savedTrips });
  } catch (error) {
    console.error('Get trips error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST save a new trip
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth header
    const userId = getUserIdFromAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find user by ID
    const user = SAMPLE_USERS[userId];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get trip data from request body
    const tripData = await request.json();
    
    // Validate required fields
    if (!tripData.destination || !tripData.startDate || !tripData.endDate) {
      return NextResponse.json(
        { error: 'Destination, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    // Create a new trip
    const newTrip = {
      id: `trip-${Date.now()}`,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: tripData.budget || 0,
      notes: tripData.notes || '',
      createdAt: new Date().toISOString(),
      itinerary: tripData.itinerary || null
    };
    
    // Add trip to user's saved trips
    user.savedTrips.push(newTrip);
    
    return NextResponse.json({
      trip: newTrip,
      message: 'Trip saved successfully'
    });
  } catch (error) {
    console.error('Save trip error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 