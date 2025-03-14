import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Sample user data (in a real app, this would be in a database)
const SAMPLE_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123', // In a real app, this would be hashed
    profileImage: 'https://source.unsplash.com/300x300/?portrait',
    createdAt: '2023-01-01T00:00:00.000Z',
    preferences: {
      travelStyle: ['budget', 'adventure'],
      budget: 'medium',
      interests: ['history', 'food', 'nature'],
      accommodation: 'hotel'
    }
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    password: 'testpass',
    createdAt: '2023-02-15T00:00:00.000Z',
    preferences: {
      travelStyle: ['luxury'],
      budget: 'high',
      interests: ['shopping', 'food', 'nightlife'],
      accommodation: 'resort'
    }
  }
];

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: LoginRequest = await request.json();

    // Validate request body
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with matching email (case insensitive)
    const user = SAMPLE_USERS.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    // Check if user exists and password matches
    if (!user || user.password !== data.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a sanitized user object without the password
    const { password, ...safeUser } = user;

    // In a real application, you would:
    // 1. Generate a JWT token or session ID
    // 2. Set it as an HTTP-only cookie
    // 3. Store the session in a database

    // For the hackathon, we'll just return the user object
    return NextResponse.json({
      user: safeUser,
      token: `fake-jwt-token-${user.id}-${Date.now()}`,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 