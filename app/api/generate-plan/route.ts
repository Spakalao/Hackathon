import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { format } from 'date-fns';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const preferences = await req.json();

    // Need API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
        },
        { status: 500 }
      );
    }

    // Format dates
    const startDate = preferences.startDate ? new Date(preferences.startDate) : null;
    const endDate = preferences.endDate ? new Date(preferences.endDate) : null;
    
    let dateRange = 'Not specified';
    if (startDate && endDate) {
      dateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    
    // Calculate trip duration
    let tripDuration = 0;
    if (startDate && endDate) {
      tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    }

    // Create the prompt for generating a travel itinerary
    const prompt = `Create a detailed budget travel plan based on the following preferences:

Budget: $${preferences.budget}
${preferences.destination ? `Destination: ${preferences.destination}` : 'Destination: To be suggested based on budget and preferences'}
Travel Dates: ${dateRange} (${tripDuration} days)
Travel Style: ${preferences.travelStyle}
Preferred Accommodation: ${preferences.accommodationType}
Interests: ${preferences.interests.join(', ')}

Please create a comprehensive travel itinerary in JSON format that includes:

1. Destination (if not specified, suggest a budget-friendly option)
2. Overview of the trip
3. Flights (approximate costs and options)
4. Accommodation recommendations with price per night
5. Activities and attractions with costs
6. Local transportation options and costs
7. Food budget and recommendations
8. Total cost breakdown by category (flights, accommodation, food, activities, transportation)
9. Budget-saving tips specific to the destination
10. Alternative options to save more money

The response should be in valid JSON format with this structure:
{
  "destination": "string",
  "budget": "string (number only)",
  "dateRange": "string",
  "overview": "string",
  "flights": {
    "outbound": "string",
    "return": "string",
    "price": "string (number only)",
    "airline": "string"
  },
  "accommodation": {
    "name": "string",
    "type": "string",
    "location": "string",
    "price": "string (number only)",
    "amenities": ["string"]
  },
  "activities": [
    {
      "name": "string",
      "description": "string",
      "price": "string (number only)",
      "category": "string"
    }
  ],
  "transportation": [
    {
      "type": "string",
      "cost": "string (number only)",
      "details": "string"
    }
  ],
  "food": {
    "budget": "string (number only)",
    "recommendations": [
      {
        "name": "string",
        "type": "string",
        "priceRange": "string"
      }
    ]
  },
  "totalCost": {
    "amount": "string (number only)",
    "breakdown": [
      {
        "category": "string",
        "amount": "string (number only)",
        "percentage": number
      }
    ]
  },
  "tips": ["string"],
  "alternativeOptions": [
    {
      "title": "string",
      "description": "string",
      "savingsAmount": "string (number only)"
    }
  ]
}

Make sure the total cost is within the specified budget. If it's not possible to stay within budget, provide alternative options to reduce costs.`;

    // Generate a JSON-formatted response with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI travel planning assistant specialized in creating budget-friendly travel itineraries. Your responses must be in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    // Parse the generated JSON
    const generatedContent = response.choices[0].message.content;
    
    if (!generatedContent) {
      throw new Error('No content generated');
    }
    
    let itinerary;
    try {
      itinerary = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json(
        { error: 'Failed to generate a valid travel plan. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error in generate-plan API:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating your travel plan. Please try again.' },
      { status: 500 }
    );
  }
} 