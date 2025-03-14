/**
 * Interface for location data used in mapping
 */
export interface LocationData {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
  rating?: number;
  photos?: string[];
  formattedAddress?: string;
  website?: string;
  phoneNumber?: string;
  openingHours?: string[];
}

/**
 * Get map data for a destination to enhance the itinerary
 */
export async function getMapData(destination: string): Promise<{
  mainLocation: LocationData;
  nearbyAttractions: LocationData[];
  travelTimes: Record<string, Record<string, number>>;
}> {
  // In a production app, this would call the actual Google Maps API
  // For now, we'll simulate the response with realistic data
  
  try {
    // Simulate fetching destination data
    const mainLocation = await simulateGeocode(destination);
    
    // Simulate fetching nearby attractions
    const nearbyAttractions = await simulateNearbySearch(mainLocation.coordinates, destination);
    
    // Simulate calculating travel times between locations
    const travelTimes = calculateTravelTimes(mainLocation, nearbyAttractions);
    
    return {
      mainLocation,
      nearbyAttractions,
      travelTimes
    };
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw new Error('Failed to fetch map data for destination');
  }
}

/**
 * Simulate geocoding a destination to get coordinates and place data
 */
async function simulateGeocode(destination: string): Promise<LocationData> {
  // In a real app, this would call the Google Geocoding API
  // For now, we'll simulate with deterministic but realistic values
  
  // Generate deterministic coordinates based on destination name
  const destinationHash = hashString(destination);
  const latBase = destinationHash % 180 - 90; // Range: -90 to 90
  const lngBase = (destinationHash * 2) % 360 - 180; // Range: -180 to 180
  
  // Add some variation to avoid exact values
  const lat = latBase + (Math.sin(destinationHash) * 0.1);
  const lng = lngBase + (Math.cos(destinationHash) * 0.1);
  
  return {
    placeId: `place-${destinationHash}`,
    name: destination,
    address: `Main Square, ${destination}`,
    coordinates: { lat, lng },
    types: ['locality', 'political'],
    rating: 4.5,
    formattedAddress: destination,
    photos: [
      `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},landmark`
    ]
  };
}

/**
 * Simulate searching for places nearby a location
 */
async function simulateNearbySearch(coordinates: { lat: number, lng: number }, destination: string): Promise<LocationData[]> {
  // In a real app, this would call the Google Places API
  // For now, we'll generate realistic place data
  
  const placeTypes = [
    { type: 'museum', name: 'Museum', tags: ['culture', 'history', 'indoor'] },
    { type: 'restaurant', name: 'Restaurant', tags: ['food', 'dining'] },
    { type: 'park', name: 'Park', tags: ['nature', 'outdoor', 'relaxation'] },
    { type: 'mall', name: 'Shopping Mall', tags: ['shopping', 'indoor'] },
    { type: 'beach', name: 'Beach', tags: ['nature', 'outdoor', 'water'] },
    { type: 'church', name: 'Historic Church', tags: ['culture', 'history', 'architecture'] },
    { type: 'castle', name: 'Castle', tags: ['history', 'architecture', 'landmark'] },
    { type: 'viewpoint', name: 'Scenic Viewpoint', tags: ['nature', 'photography', 'outdoor'] },
    { type: 'theater', name: 'Theater', tags: ['entertainment', 'culture', 'indoor'] },
    { type: 'market', name: 'Local Market', tags: ['shopping', 'food', 'culture'] }
  ];
  
  // Generate 8-12 places
  const numPlaces = 8 + (hashString(destination) % 5);
  const places: LocationData[] = [];
  
  for (let i = 0; i < numPlaces; i++) {
    // Select a place type based on a hash of the destination and index
    const typeIndex = (hashString(`${destination}-${i}`) % placeTypes.length);
    const placeType = placeTypes[typeIndex];
    
    // Generate variant coordinates nearby the main location
    const latVariation = (Math.sin(i * 1000) * 0.05);
    const lngVariation = (Math.cos(i * 1000) * 0.05);
    
    const placeName = `${destination} ${placeType.name} ${i + 1}`;
    
    places.push({
      placeId: `place-${destination}-${i}`,
      name: placeName,
      address: `${100 + i} Main St, ${destination}`,
      coordinates: { 
        lat: coordinates.lat + latVariation, 
        lng: coordinates.lng + lngVariation 
      },
      types: [placeType.type, ...placeType.tags],
      rating: 3.5 + (hashString(placeName) % 30) / 10, // Rating between 3.5 and 5.0
      photos: [
        `https://source.unsplash.com/600x400/?${encodeURIComponent(placeType.type)},${encodeURIComponent(destination)}`
      ]
    });
  }
  
  return places;
}

/**
 * Calculate travel times between locations
 */
function calculateTravelTimes(
  mainLocation: LocationData, 
  places: LocationData[]
): Record<string, Record<string, number>> {
  // In a real app, this would use the Google Distance Matrix API
  // Here we'll simulate realistic travel times
  
  const travelTimes: Record<string, Record<string, number>> = {
    'main': {}
  };
  
  // Add travel times from main location to all places
  places.forEach((place, i) => {
    const distance = calculateDistance(
      mainLocation.coordinates.lat, 
      mainLocation.coordinates.lng,
      place.coordinates.lat,
      place.coordinates.lng
    );
    
    // Simulate travel time based on distance
    // Assuming average speed of 30 km/h in a city
    const travelTimeMinutes = Math.ceil(distance * 2); // Simple approximation
    
    travelTimes['main'][place.placeId] = travelTimeMinutes;
    
    // Initialize entry for this place
    travelTimes[place.placeId] = {
      'main': travelTimeMinutes
    };
    
    // Calculate times between this place and all previous places
    places.slice(0, i).forEach(otherPlace => {
      const placeDist = calculateDistance(
        place.coordinates.lat,
        place.coordinates.lng,
        otherPlace.coordinates.lat,
        otherPlace.coordinates.lng
      );
      
      const placeTravelTime = Math.ceil(placeDist * 2);
      
      travelTimes[place.placeId][otherPlace.placeId] = placeTravelTime;
      travelTimes[otherPlace.placeId][place.placeId] = placeTravelTime;
    });
  });
  
  return travelTimes;
}

/**
 * Calculate distance between two coordinates (haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
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