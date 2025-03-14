import { OpenAIStream } from 'ai';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Types for itinerary generation
export interface ItineraryGenerationParams {
  destination: string;
  budget: number;
  tripDuration: number;
  startDate: string;
  travelers: number;
  interests: string[];
  flights: any[];
  hotels: any[];
  activities: any[];
  mapData: any;
}

export interface Activity {
  name: string;
  description: string;
  cost: string;
  type: string;
  location: string;
  duration: string;
  imageUrl?: string;
}

export interface Day {
  date: string;
  activities: Activity[];
  accommodation: {
    name: string;
    location: string;
    cost: string;
    imageUrl?: string;
  };
  transportation: {
    type: string;
    details: string;
    cost: string;
  };
  alternativeActivities?: Activity[];
}

export interface Itinerary {
  destination: string;
  totalCost: string;
  duration: string;
  days: Day[];
  travelTips: string[];
}

/**
 * Generate a travel itinerary using AI and provided travel data
 */
export async function generateItinerary(params: ItineraryGenerationParams): Promise<Itinerary> {
  try {
    // Format the date for the itinerary
    const startDate = new Date(params.startDate);
    
    // Create prompt for AI
    const prompt = createItineraryPrompt(params);
    
    // Call OpenAI API to generate the itinerary
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner who creates detailed, day-by-day itineraries based on budget constraints, traveler preferences, and available options. Your output should be in JSON format following the exact structure provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });
    
    // Parse the response
    const rawItinerary = JSON.parse(response.choices[0].message.content || "{}");
    
    // Process and enhance the AI-generated itinerary
    const processedItinerary = processItinerary(rawItinerary, params);
    
    return processedItinerary;
  } catch (error) {
    console.error('Error in itinerary generation:', error);
    throw new Error('Failed to generate itinerary with AI');
  }
}

/**
 * Create detailed prompt for the AI to generate an itinerary
 */
function createItineraryPrompt(params: ItineraryGenerationParams): string {
  // Format budget for display
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(params.budget);
  
  // Format dates for the itinerary
  const startDate = new Date(params.startDate);
  const dates = Array.from({ length: params.tripDuration }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });
  
  // Information about available flights
  const flightsInfo = params.flights.length > 0 
    ? `Available flights: ${JSON.stringify(params.flights.slice(0, 3))}`
    : 'No specific flight information available';
  
  // Information about available accommodations
  const hotelsInfo = params.hotels.length > 0
    ? `Available accommodations: ${JSON.stringify(params.hotels.slice(0, 3))}`
    : 'No specific accommodation information available';
  
  // Information about available activities
  const activitiesInfo = params.activities.length > 0
    ? `Available activities: ${JSON.stringify(params.activities.slice(0, 10))}`
    : 'No specific activity information available';
  
  return `
  Create a detailed ${params.tripDuration}-day travel itinerary for ${params.travelers} traveler(s) to ${params.destination} with a total budget of ${formattedBudget}.

  Trip Details:
  - Destination: ${params.destination}
  - Start Date: ${params.startDate}
  - Duration: ${params.tripDuration} days
  - Budget: ${formattedBudget}
  - Number of Travelers: ${params.travelers}
  - Interests: ${params.interests.join(', ')}

  Available Options:
  ${flightsInfo}
  ${hotelsInfo}
  ${activitiesInfo}

  The itinerary should include:
  1. Daily activities that match the travelers' interests
  2. Accommodation details for each night
  3. Transportation options between locations
  4. Cost estimates for all activities, accommodations, and transportation
  5. Travel tips specific to the destination

  Please adhere strictly to the budget of ${formattedBudget} for the entire trip.
  
  Your response should be in JSON format with the following structure:
  {
    "destination": "string",
    "totalCost": "string (formatted as currency)",
    "duration": "string (e.g., '5 days')",
    "days": [
      {
        "date": "string (YYYY-MM-DD)",
        "activities": [
          {
            "name": "string",
            "description": "string",
            "cost": "string (formatted as currency)",
            "type": "string (e.g., 'Sightseeing', 'Cultural', 'Adventure')",
            "location": "string",
            "duration": "string (e.g., '2 hours')"
          }
        ],
        "accommodation": {
          "name": "string",
          "location": "string",
          "cost": "string (formatted as currency)"
        },
        "transportation": {
          "type": "string",
          "details": "string",
          "cost": "string (formatted as currency)"
        }
      }
    ],
    "travelTips": ["string"]
  }
  `;
}

/**
 * Process and enhance the AI-generated itinerary
 */
function processItinerary(rawItinerary: any, params: ItineraryGenerationParams): Itinerary {
  // Validate and enhance the itinerary structure
  const days = rawItinerary.days?.map((day: any, index: number) => {
    // Find a hotel from our dataset that matches or is similar to what AI suggested
    const matchedHotel = findMatchingHotel(day.accommodation?.name, params.hotels);
    
    // Process activities and match with our activity database
    const processedActivities = day.activities?.map((activity: any) => {
      const matchedActivity = findMatchingActivity(activity.name, params.activities);
      return {
        ...activity,
        imageUrl: matchedActivity?.imageUrl || `https://source.unsplash.com/300x200/?${activity.type.toLowerCase()},${params.destination.toLowerCase()}`,
      };
    }) || [];
    
    return {
      ...day,
      accommodation: {
        ...day.accommodation,
        imageUrl: matchedHotel?.imageUrl || `https://source.unsplash.com/300x200/?hotel,${params.destination.toLowerCase()}`,
      },
      activities: processedActivities,
    };
  }) || [];
  
  // Ensure all required properties exist
  return {
    destination: rawItinerary.destination || params.destination,
    totalCost: rawItinerary.totalCost || `$${params.budget.toFixed(2)}`,
    duration: rawItinerary.duration || `${params.tripDuration} days`,
    days: days,
    travelTips: rawItinerary.travelTips || generateDefaultTravelTips(params.destination),
  };
}

/**
 * Find a matching hotel from our database
 */
function findMatchingHotel(hotelName: string, hotels: any[]): any | undefined {
  if (!hotelName || !hotels || hotels.length === 0) return undefined;
  
  // Simple string matching - in a real app, this would be more sophisticated
  return hotels.find(hotel => 
    hotel.name.toLowerCase().includes(hotelName.toLowerCase()) || 
    hotelName.toLowerCase().includes(hotel.name.toLowerCase())
  );
}

/**
 * Find a matching activity from our database
 */
function findMatchingActivity(activityName: string, activities: any[]): any | undefined {
  if (!activityName || !activities || activities.length === 0) return undefined;
  
  // Simple string matching - in a real app, this would be more sophisticated
  return activities.find(activity => 
    activity.name.toLowerCase().includes(activityName.toLowerCase()) || 
    activityName.toLowerCase().includes(activity.name.toLowerCase())
  );
}

/**
 * Generate default travel tips for a destination
 */
function generateDefaultTravelTips(destination: string): string[] {
  return [
    `Research local customs and etiquette before visiting ${destination}.`,
    `Consider purchasing travel insurance for your trip to ${destination}.`,
    `Check if there are any local festivals or events during your visit to ${destination}.`,
    `Always keep a digital copy of your important documents while traveling to ${destination}.`,
    `Learn a few basic phrases in the local language of ${destination}.`,
  ];
} 