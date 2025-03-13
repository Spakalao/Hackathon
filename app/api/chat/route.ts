import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Need API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
        },
        { status: 500 }
      );
    }

    // Create the AI prompt with context about being a budget travel planner
    const prompt = [
      {
        role: 'system',
        content: `You are a helpful AI travel assistant, specialized in budget-friendly travel planning.
        
Your goal is to help users plan affordable travel experiences that match their budget, preferences, and travel style.
        
When users ask about destinations, provide budget-conscious suggestions for flights, accommodations, activities, and local transportation. 
        
Consider factors like:
- Seasonal pricing and weather
- Budget-friendly destinations
- Value for money experiences
- Local insider tips to save money
- Alternative options to expensive tourist attractions
        
If a user is interested in a specific destination, help them understand their budget feasibility and provide concrete suggestions to make their trip affordable.

Always be friendly, encouraging, and focus on maximizing the travel experience within budget constraints.`
      },
      ...messages
    ];

    // Generate a response with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: prompt,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    // Convert the response into a text-streaming format
    const stream = OpenAIStream(response);
    
    // Return a StreamingTextResponse, which is a ReadableStream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'An error occurred during your request.' },
      { status: 500 }
    );
  }
} 