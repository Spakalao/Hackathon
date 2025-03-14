import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the runtime to edge for better performance
export const runtime = 'edge';

// Mock data for development
const mockAccommodations = [
  {
    id: 'acc-001',
    name: 'Budget Backpackers Hostel',
    type: 'hostel',
    location: 'Downtown District',
    price_per_night: 25,
    currency: 'USD',
    rating: 4.2,
    rating_count: 156,
    distance_from_center: 0.8,
    amenities: ['Free WiFi', 'Shared Kitchen', 'Lockers', 'Common Area'],
    available_rooms: 12,
    cancellation_policy: 'Free cancellation until 24 hours before check-in',
    breakfast_included: false,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?hostel'
  },
  {
    id: 'acc-002',
    name: 'City Center Budget Hotel',
    type: 'budget_hotel',
    location: 'City Center',
    price_per_night: 65,
    currency: 'USD',
    rating: 3.8,
    rating_count: 203,
    distance_from_center: 0.2,
    amenities: ['Free WiFi', 'Private Bathroom', 'Air Conditioning', 'TV'],
    available_rooms: 5,
    cancellation_policy: 'Free cancellation until 48 hours before check-in',
    breakfast_included: true,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?hotel'
  },
  {
    id: 'acc-003',
    name: 'Cozy Budget Apartment',
    type: 'apartment',
    location: 'Residential Area',
    price_per_night: 85,
    currency: 'USD',
    rating: 4.5,
    rating_count: 87,
    distance_from_center: 1.5,
    amenities: ['Free WiFi', 'Kitchen', 'Washing Machine', 'Air Conditioning', 'TV'],
    available_rooms: 2,
    cancellation_policy: 'Moderate cancellation policy',
    breakfast_included: false,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?apartment'
  },
  {
    id: 'acc-004',
    name: 'Riverside Guesthouse',
    type: 'guesthouse',
    location: 'Riverside District',
    price_per_night: 45,
    currency: 'USD',
    rating: 4.1,
    rating_count: 124,
    distance_from_center: 2.1,
    amenities: ['Free WiFi', 'Garden', 'Terrace', 'Shared Kitchen'],
    available_rooms: 8,
    cancellation_policy: 'Free cancellation until 3 days before check-in',
    breakfast_included: true,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?guesthouse'
  },
  {
    id: 'acc-005',
    name: 'Eco Backpackers',
    type: 'hostel',
    location: 'Green District',
    price_per_night: 22,
    currency: 'USD',
    rating: 4.0,
    rating_count: 178,
    distance_from_center: 3.5,
    amenities: ['Free WiFi', 'Bicycle Rental', 'Shared Kitchen', 'Garden'],
    available_rooms: 20,
    cancellation_policy: 'Free cancellation until 24 hours before check-in',
    breakfast_included: false,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?eco,hostel'
  },
  {
    id: 'acc-006',
    name: 'Budget Inn Express',
    type: 'budget_hotel',
    location: 'Business District',
    price_per_night: 55,
    currency: 'USD',
    rating: 3.7,
    rating_count: 225,
    distance_from_center: 1.8,
    amenities: ['Free WiFi', 'Private Bathroom', 'Work Desk', 'Parking'],
    available_rooms: 15,
    cancellation_policy: 'Free cancellation until 24 hours before check-in',
    breakfast_included: true,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?budget,hotel'
  },
  {
    id: 'acc-007',
    name: 'Studio Budget Apartment',
    type: 'apartment',
    location: 'Art District',
    price_per_night: 78,
    currency: 'USD',
    rating: 4.3,
    rating_count: 96,
    distance_from_center: 1.2,
    amenities: ['Free WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Balcony'],
    available_rooms: 4,
    cancellation_policy: 'Moderate cancellation policy',
    breakfast_included: false,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?studio,apartment'
  },
  {
    id: 'acc-008',
    name: 'Urban Budget Guesthouse',
    type: 'guesthouse',
    location: 'Old Town',
    price_per_night: 40,
    currency: 'USD',
    rating: 4.4,
    rating_count: 142,
    distance_from_center: 0.5,
    amenities: ['Free WiFi', 'Shared Bathroom', 'Common Area', 'Terrace'],
    available_rooms: 6,
    cancellation_policy: 'Non-refundable',
    breakfast_included: true,
    thumbnail_url: 'https://source.unsplash.com/random/300x200/?urban,guesthouse'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Extract search parameters
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || '';
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = parseInt(searchParams.get('adults') || '1');
    const type = searchParams.get('type');
    
    // Validate required parameters
    if (!location || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required search parameters' },
        { status: 400 }
      );
    }
    
    // In a real application, we would call an external API or query a database here
    // For this example, we'll filter our mock data based on the search parameters
    
    // Simulate API filtering logic
    let filteredAccommodations = [...mockAccommodations];
    
    // Filter by accommodation type if specified
    if (type && type !== 'all') {
      filteredAccommodations = filteredAccommodations.filter(acc => acc.type === type);
    }
    
    // Simple location matching (in a real app, this would be more sophisticated)
    if (location) {
      const locationLower = location.toLowerCase();
      filteredAccommodations = filteredAccommodations.filter(acc => 
        acc.location.toLowerCase().includes(locationLower) 
      );
    }
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sort by price (lowest first)
    filteredAccommodations.sort((a, b) => a.price_per_night - b.price_per_night);
    
    // In a real app, we would adjust prices based on dates, calculate total price, etc.
    
    return NextResponse.json({
      accommodations: filteredAccommodations,
      totalResults: filteredAccommodations.length,
      searchParams: {
        location,
        checkIn,
        checkOut,
        adults,
        type: type || 'all'
      }
    });
  } catch (error) {
    console.error('Error handling accommodation search:', error);
    return NextResponse.json(
      { error: 'Failed to process accommodation search' },
      { status: 500 }
    );
  }
}

// Helper function to generate realistic mock accommodation data
function generateMockAccommodations(
  location: string,
  type: string,
  adults: number
) {
  // Define different accommodation types with price ranges
  const accommodationTypes = {
    hostel: {
      name: 'Hostel',
      priceRange: [15, 50],
      amenities: [
        'Free Wi-Fi', 'Shared Kitchen', 'Luggage Storage', 
        'Common Area', '24-Hour Reception', 'Security Lockers'
      ]
    },
    budget_hotel: {
      name: 'Budget Hotel',
      priceRange: [40, 100],
      amenities: [
        'Free Wi-Fi', 'Private Bathroom', 'Air Conditioning', 
        'TV', '24-Hour Reception', 'Daily Housekeeping'
      ]
    },
    apartment: {
      name: 'Apartment',
      priceRange: [60, 150],
      amenities: [
        'Full Kitchen', 'Living Area', 'Free Wi-Fi', 
        'Washing Machine', 'Private Bathroom', 'TV'
      ]
    },
    guesthouse: {
      name: 'Guesthouse',
      priceRange: [30, 80],
      amenities: [
        'Free Wi-Fi', 'Shared Bathroom', 'Breakfast Available',
        'Garden', 'Terrace', 'Shared Kitchen'
      ]
    }
  };
  
  // Property names by accommodation type
  const propertyNames = {
    hostel: [
      'Backpackers Haven', 'Nomad Hostel', 'Budget Bunks', 
      'Traveler\'s Rest', 'Globe Trotter\'s Lodge', 'Wanderlust Hostel'
    ],
    budget_hotel: [
      'City Budget Inn', 'Economy Suites', 'Value Stay Hotel', 
      'Comfort Budget Hotel', 'Sleep Well Inn', 'Thrifty Lodging'
    ],
    apartment: [
      'Urban Flat', 'City View Apartment', 'Home Away Suites', 
      'Downtown Apartment', 'Cozy Living Space', 'Budget Apartment'
    ],
    guesthouse: [
      'Homely Guest House', 'Traveler\'s Retreat', 'Local Living', 
      'Family Guesthouse', 'Budget B&B', 'Cozy Corner'
    ]
  };
  
  // Get random number of ratings between 50 and 500
  const getRandomRatings = () => Math.floor(Math.random() * 450) + 50;
  
  // Get random rating between 7.0 and 9.8
  const getRandomRating = () => (Math.floor(Math.random() * 28) + 70) / 10;
  
  // Get random distance from center between 0.1 and 5.0 km
  const getRandomDistance = () => (Math.floor(Math.random() * 49) + 1) / 10;
  
  // Get price within a range, adjusted for number of adults
  const getRandomPrice = (min: number, max: number) => {
    const basePrice = Math.floor(Math.random() * (max - min + 1)) + min;
    // Adjust price based on adults (more than 2 increases the price)
    const adultAdjustment = adults > 2 ? (adults - 2) * (basePrice * 0.3) : 0;
    return Math.floor(basePrice + adultAdjustment);
  };
  
  // Get random subset of amenities
  const getRandomAmenities = (allAmenities: string[], count: number) => {
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Get location neighborhoods
  const getNeighborhoods = (location: string) => {
    const neighborhoods = [
      'Downtown', 'City Center', 'Old Town', 'Historic District',
      'Riverside', 'Beach Area', 'Cultural Quarter', 'Budget District'
    ];
    return neighborhoods.map(n => `${n}, ${location}`);
  };
  
  const neighborhoods = getNeighborhoods(location);
  
  // Generate accommodations based on type
  let accommodations = [];
  const typesToInclude = type === 'all' 
    ? ['hostel', 'budget_hotel', 'apartment', 'guesthouse'] 
    : [type];
  
  for (const accType of typesToInclude) {
    if (!accommodationTypes[accType as keyof typeof accommodationTypes]) continue;
    
    const typeInfo = accommodationTypes[accType as keyof typeof accommodationTypes];
    const names = propertyNames[accType as keyof typeof propertyNames];
    
    // Generate 3-5 options per type
    const count = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      const price = getRandomPrice(typeInfo.priceRange[0], typeInfo.priceRange[1]);
      
      accommodations.push({
        id: `${accType}-${i + 1}`,
        name: `${name} ${location}`,
        type: typeInfo.name,
        location: neighborhood,
        price_per_night: price,
        currency: 'USD',
        rating: getRandomRating(),
        rating_count: getRandomRatings(),
        distance_from_center: getRandomDistance(),
        amenities: getRandomAmenities(typeInfo.amenities, Math.floor(Math.random() * 3) + 3),
        available_rooms: Math.floor(Math.random() * 5) + 1,
        cancellation_policy: Math.random() > 0.5 ? 'Free cancellation' : 'Non-refundable',
        breakfast_included: Math.random() > 0.7,
        thumbnail_url: `https://source.unsplash.com/300x200/?${typeInfo.name.toLowerCase().replace(' ', ',')}`,
      });
    }
  }
  
  // Sort by price (lowest first)
  return accommodations.sort((a, b) => a.price_per_night - b.price_per_night);
} 