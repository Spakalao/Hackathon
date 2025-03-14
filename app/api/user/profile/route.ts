import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Sample user data (in a real app, this would be in a database)
const SAMPLE_USERS = {
  '1': {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    profileImage: 'https://source.unsplash.com/300x300/?portrait',
    createdAt: '2023-01-01T00:00:00.000Z',
    preferences: {
      travelStyle: ['budget', 'adventure'],
      budget: 'medium',
      interests: ['history', 'food', 'nature'],
      accommodation: 'hotel'
    },
    savedTrips: [
      {
        id: 'trip-1',
        destination: 'Paris, France',
        startDate: '2023-06-15',
        endDate: '2023-06-22',
        budget: 1500,
        notes: 'Summer vacation with family'
      }
    ]
  },
  '2': {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    createdAt: '2023-02-15T00:00:00.000Z',
    preferences: {
      travelStyle: ['luxury'],
      budget: 'high',
      interests: ['shopping', 'food', 'nightlife'],
      accommodation: 'resort'
    },
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

// GET user profile
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
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
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
    
    // Get update data from request body
    const updateData = await request.json();
    
    // Validate update data
    const allowedFields = ['name', 'profileImage', 'preferences'];
    const updates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (field in updateData) {
        if (field === 'preferences' && typeof updateData[field] === 'object') {
          // Merge preferences
          updates[field] = {
            ...user[field],
            ...updateData[field]
          };
        } else {
          updates[field] = updateData[field];
        }
      }
    }
    
    // Update user (in a real app, this would update the database)
    const updatedUser = {
      ...user,
      ...updates
    };
    
    SAMPLE_USERS[userId] = updatedUser;
    
    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 