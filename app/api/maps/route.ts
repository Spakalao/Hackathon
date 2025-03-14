import { NextResponse } from 'next/server';

// Set the runtime to edge for better performance
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    if (!location) {
      return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ 
        error: 'Google Maps API key not configured',
        message: 'Please set the GOOGLE_MAPS_API_KEY environment variable'
      }, { status: 500 });
    }

    // Call Google Maps Geocoding API to get location data
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the location data
    return NextResponse.json({
      success: true,
      location: location,
      results: data.results
    });
  } catch (error) {
    console.error('Error in maps API:', error);
    return NextResponse.json(
      { error: 'An error occurred during your request.' },
      { status: 500 }
    );
  }
} 