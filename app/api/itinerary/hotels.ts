/**
 * Interface for hotel data
 */
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  roomType: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  distanceFromCenter?: string;
  cancellationPolicy?: string;
  checkIn?: string;
  checkOut?: string;
  numberOfGuests?: number;
  numberOfRooms?: number;
}

/**
 * Search for hotels based on user preferences
 */
export async function searchHotels(
  destination: string,
  checkInDate: string,
  checkOutDate: string,
  guests: number,
  accommodationType: string = 'hotel'
): Promise<Hotel[]> {
  try {
    // In a real app, this would call an external API like Booking.com, Hotels.com, etc.
    // For the hackathon, we'll generate realistic hotel data
    
    // Parse the destination to extract city and country
    const parts = destination.split(',');
    const city = parts[0].trim();
    const country = parts.length > 1 ? parts[1].trim() : 'Unknown';
    
    // Parse dates to calculate length of stay
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get accommodation type (hotel, hostel, apartment, etc.)
    const accType = accommodationType.toLowerCase();
    
    // Generate a seed based on the destination and dates
    const seed = hashString(`${destination}-${checkInDate}-${checkOutDate}`);
    
    // Generate hotels
    return generateHotels(city, country, nights, guests, accType, seed);
  } catch (error) {
    console.error('Error searching hotels:', error);
    return []; // Return empty array instead of throwing to avoid breaking the entire request
  }
}

/**
 * Generate realistic hotel data for a destination
 */
function generateHotels(
  city: string,
  country: string,
  nights: number,
  guests: number,
  accommodationType: string,
  seed: number
): Hotel[] {
  const hotels: Hotel[] = [];
  
  // Determine the number of hotels to generate (between 8 and 15)
  const numHotels = 8 + (seed % 8);
  
  // Hotel name prefixes and suffixes based on accommodation type
  const namePrefix = getNamePrefix(accommodationType);
  const nameSuffix = getNameSuffix(accommodationType);
  
  // Generic hotel amenities
  const commonAmenities = [
    'Free WiFi',
    'Air conditioning',
    'TV',
    'Private bathroom',
    'Breakfast included'
  ];
  
  // Luxury amenities for higher-rated hotels
  const luxuryAmenities = [
    'Swimming pool',
    'Spa',
    'Fitness center',
    'Room service',
    'Restaurant',
    'Bar',
    'Concierge service',
    'Airport shuttle',
    'Business center',
    'Parking'
  ];
  
  // Generate the hotels
  for (let i = 0; i < numHotels; i++) {
    // Generate a unique seed for this hotel
    const hotelSeed = seed + i * 100;
    
    // Generate a hotel name
    const nameIndex = hotelSeed % namePrefix.length;
    const suffixIndex = (hotelSeed + 7) % nameSuffix.length;
    const hotelName = `${namePrefix[nameIndex]} ${city} ${nameSuffix[suffixIndex]}`;
    
    // Generate hotel rating (between 3 and 5 stars)
    const baseRating = 3.0;
    const ratingBonus = (hotelSeed % 20) / 10; // 0.0 to 1.9
    const rating = baseRating + ratingBonus;
    
    // Generate a number of reviews (more for higher-rated hotels)
    const reviewCount = 50 + Math.floor(hotelSeed % 1000);
    
    // Generate price per night based on rating, accommodation type, and a random factor
    const basePrice = getBasePrice(accommodationType, rating);
    const priceVariability = 0.85 + ((hotelSeed % 30) / 100); // 0.85 to 1.15
    const pricePerNight = Math.round(basePrice * priceVariability);
    
    // Calculate total price for the stay
    const totalPrice = pricePerNight * nights * Math.ceil(guests / 2); // Assume each room fits 2 guests
    
    // Generate amenities (more for higher-rated hotels)
    const amenities = [...commonAmenities];
    const numLuxuryAmenities = Math.min(Math.floor(rating - 2), luxuryAmenities.length);
    
    // Add some luxury amenities for higher-rated hotels
    for (let j = 0; j < numLuxuryAmenities; j++) {
      amenities.push(luxuryAmenities[(hotelSeed + j * 11) % luxuryAmenities.length]);
    }
    
    // Generate a room type
    const roomType = getRoomType(accommodationType, hotelSeed);
    
    // Generate a description
    const description = generateDescription(hotelName, city, rating, accommodationType);
    
    // Generate an address
    const address = `${100 + (hotelSeed % 900)} ${getStreetName(hotelSeed)} St, ${city}`;
    
    // Generate distance from city center (0.1 to 5.0 km)
    const distance = (0.1 + (hotelSeed % 49) / 10).toFixed(1);
    
    // Generate check-in and check-out times
    const checkInHour = 14 + (hotelSeed % 4); // 14:00 to 17:00
    const checkOutHour = 10 + (hotelSeed % 3); // 10:00 to 12:00
    
    // Generate image URL (in a real app, this would be a real image)
    const imageUrl = `https://source.unsplash.com/600x400/?${accommodationType},${encodeURIComponent(city)}`;
    
    hotels.push({
      id: `hotel-${hotelSeed}`,
      name: hotelName,
      description,
      address,
      city,
      country,
      price: totalPrice,
      currency: 'USD',
      pricePerNight,
      rating,
      reviewCount,
      amenities,
      roomType,
      imageUrl,
      distanceFromCenter: `${distance} km`,
      cancellationPolicy: getCancellationPolicy(hotelSeed),
      checkIn: `${checkInHour}:00`,
      checkOut: `${checkOutHour}:00`,
      numberOfGuests: guests,
      numberOfRooms: Math.ceil(guests / 2)
    });
  }
  
  // Sort by price
  return hotels.sort((a, b) => a.price - b.price);
}

/**
 * Get hotel name prefixes based on accommodation type
 */
function getNamePrefix(accommodationType: string): string[] {
  switch (accommodationType) {
    case 'hotel':
      return ['Grand', 'Royal', 'Imperial', 'Palace', 'Luxury', 'Comfort', 'Central', 'Premier'];
    case 'hostel':
      return ['Backpacker\'s', 'Traveler\'s', 'City', 'Budget', 'Friendly', 'Adventure', 'Urban'];
    case 'apartment':
      return ['Modern', 'Luxury', 'Central', 'Cozy', 'Elegant', 'Urban', 'Executive', 'Premium'];
    case 'resort':
      return ['Paradise', 'Tropical', 'Oceanview', 'Beachfront', 'Luxury', 'Island', 'Exclusive'];
    default:
      return ['Grand', 'Central', 'Comfort', 'City', 'Urban'];
  }
}

/**
 * Get hotel name suffixes based on accommodation type
 */
function getNameSuffix(accommodationType: string): string[] {
  switch (accommodationType) {
    case 'hotel':
      return ['Hotel', 'Suites', 'Inn', 'Plaza', 'Grand Hotel', 'Residency', 'Hotel & Spa'];
    case 'hostel':
      return ['Hostel', 'Backpackers', 'House', 'Lodge', 'Hub', 'Zone', 'Nest'];
    case 'apartment':
      return ['Apartments', 'Suites', 'Residences', 'Studios', 'Lofts', 'Flats'];
    case 'resort':
      return ['Resort', 'Resort & Spa', 'Beach Resort', 'Villas', 'Island Resort', 'Retreat'];
    default:
      return ['Hotel', 'Inn', 'Suites', 'Lodge'];
  }
}

/**
 * Get base price for accommodation based on type and rating
 */
function getBasePrice(accommodationType: string, rating: number): number {
  const typeMultiplier = {
    'hotel': 1.0,
    'hostel': 0.4,
    'apartment': 1.2,
    'resort': 1.8,
    'villa': 2.5,
    'guesthouse': 0.7
  }[accommodationType] || 1.0;
  
  // Rating has a significant impact on price
  const ratingMultiplier = Math.pow(1.3, rating - 3); // Exponential increase with rating
  
  // Base price around $100
  return Math.round(100 * typeMultiplier * ratingMultiplier);
}

/**
 * Get room type based on accommodation type
 */
function getRoomType(accommodationType: string, seed: number): string {
  const roomTypes = {
    'hotel': ['Standard Room', 'Deluxe Room', 'Superior Room', 'Junior Suite', 'Executive Suite'],
    'hostel': ['Shared Dormitory', 'Private Room', 'Family Room', 'Deluxe Dormitory', 'Ensuite Room'],
    'apartment': ['Studio Apartment', 'One-Bedroom Apartment', 'Two-Bedroom Apartment', 'Penthouse', 'Loft'],
    'resort': ['Deluxe Room', 'Garden View Suite', 'Ocean View Room', 'Villa', 'Bungalow'],
    'villa': ['Luxury Villa', 'Private Pool Villa', 'Garden Villa', 'Beachfront Villa', 'Family Villa'],
    'guesthouse': ['Standard Room', 'Double Room', 'Family Room', 'Deluxe Room', 'Suite']
  };
  
  const types = roomTypes[accommodationType] || roomTypes['hotel'];
  const index = seed % types.length;
  
  return types[index];
}

/**
 * Generate a street name
 */
function getStreetName(seed: number): string {
  const streetNames = [
    'Main', 'Park', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Market',
    'Broadway', 'Hill', 'Lake', 'River', 'Church', 'High', 'Center'
  ];
  
  return streetNames[seed % streetNames.length];
}

/**
 * Generate a cancellation policy
 */
function getCancellationPolicy(seed: number): string {
  const policies = [
    'Free cancellation up to 24 hours before check-in',
    'Free cancellation up to 48 hours before check-in',
    'Free cancellation up to 7 days before check-in',
    'Non-refundable',
    'Partially refundable (70% refund up to 48 hours before check-in)'
  ];
  
  return policies[seed % policies.length];
}

/**
 * Generate a hotel description
 */
function generateDescription(hotelName: string, city: string, rating: number, type: string): string {
  const qualityAdjectives = [
    'excellent', 'fantastic', 'wonderful', 'great', 'superb', 'exceptional'
  ];
  
  const locationAdjectives = [
    'centrally located', 'conveniently situated', 'ideally located', 'perfectly positioned'
  ];
  
  const cityDescriptions = [
    'vibrant', 'historic', 'beautiful', 'charming', 'exciting', 'picturesque'
  ];
  
  const seedForThis = hashString(`${hotelName}-${city}`);
  
  const qualityAdj = qualityAdjectives[seedForThis % qualityAdjectives.length];
  const locationAdj = locationAdjectives[(seedForThis + 1) % locationAdjectives.length];
  const cityDesc = cityDescriptions[(seedForThis + 2) % cityDescriptions.length];
  
  let description = `${hotelName} offers ${qualityAdj} accommodations in ${city}. This ${rating.toFixed(1)}-star ${type} is ${locationAdj} in the ${cityDesc} city center.`;
  
  if (rating >= 4.5) {
    description += ' Guests consistently rate the property highly for its exceptional service and amenities.';
  } else if (rating >= 4.0) {
    description += ' The property is well-regarded for its comfort and convenient location.';
  } else {
    description += ' The property offers good value for money in a convenient setting.';
  }
  
  return description;
}

/**
 * Generate a simple hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
} 