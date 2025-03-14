import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// In a real app, users would be stored in a database
const registeredUsers: Record<string, any> = {
  'demo@example.com': {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123', // In a real app, this would be hashed
    profileImage: 'https://source.unsplash.com/300x300/?portrait',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  'user@example.com': {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    password: 'testpass',
    createdAt: '2023-02-15T00:00:00.000Z'
  }
};

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: RegisterRequest = await request.json();

    // Validate request body
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (registeredUsers[data.email.toLowerCase()]) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Validate password strength (in a real app, this would be more robust)
    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create a new user (in a real app, the password would be hashed)
    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      preferences: {
        travelStyle: ['budget'],
        budget: 'medium',
        interests: [],
        accommodation: 'hotel'
      }
    };

    // Store the user (in a real app, this would be in a database)
    registeredUsers[data.email.toLowerCase()] = newUser;

    // Create a sanitized user object without the password
    const { password, ...safeUser } = newUser;

    // In a real application, you would:
    // 1. Generate a JWT token or session ID
    // 2. Set it as an HTTP-only cookie
    // 3. Store the session in a database

    // For the hackathon, we'll just return the user object
    return NextResponse.json({
      user: safeUser,
      token: `fake-jwt-token-${newUser.id}-${Date.now()}`,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 