/**
 * Interface for activity data
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  location: string;
  address: string;
  city: string;
  price: number;
  currency: string;
  duration: string;  // e.g., "2 hours"
  rating: number;
  reviewCount: number;
  imageUrl: string;
  openingHours?: string;
  bookingRequired?: boolean;
  latitude?: number;
  longitude?: number;
  distanceFromCenter?: string;
  suitableFor?: string[];
  highlights?: string[];
  tags?: string[];
}

/**
 * Find activities based on destination and user interests
 */
export async function findActivities(
  destination: string,
  interests: string[] = [],
  tripDuration: number = 3
): Promise<Activity[]> {
  try {
    // In a real app, this would call external APIs like Viator, GetYourGuide, etc.
    // For the hackathon, we'll generate realistic activity data
    
    // Parse the destination to extract city
    const city = destination.split(',')[0].trim();
    
    // Generate a seed based on the destination
    const seed = hashString(destination);
    
    // Generate activities
    return generateActivities(city, interests, tripDuration, seed);
  } catch (error) {
    console.error('Error finding activities:', error);
    return []; // Return empty array instead of throwing to avoid breaking the entire request
  }
}

/**
 * Generate realistic activity data for a destination
 */
function generateActivities(
  city: string,
  interests: string[],
  tripDuration: number,
  seed: number
): Activity[] {
  const activities: Activity[] = [];
  
  // Define basic activity categories
  const categories = [
    {
      name: 'Sightseeing',
      subcategories: ['Landmarks', 'Architecture', 'City Tours', 'Walking Tours', 'Bus Tours'],
      interests: ['history', 'culture', 'architecture', 'sightseeing']
    },
    {
      name: 'Cultural',
      subcategories: ['Museums', 'Art Galleries', 'Theaters', 'Historical Sites', 'Local Customs'],
      interests: ['history', 'culture', 'art', 'museums', 'education']
    },
    {
      name: 'Food & Drink',
      subcategories: ['Food Tours', 'Cooking Classes', 'Wine Tasting', 'Local Cuisine', 'Cafes'],
      interests: ['food', 'culinary', 'wine', 'local cuisine', 'gastronomy']
    },
    {
      name: 'Nature & Outdoors',
      subcategories: ['Parks', 'Gardens', 'Hiking', 'Wildlife', 'Beaches'],
      interests: ['nature', 'outdoors', 'hiking', 'wildlife', 'adventure']
    },
    {
      name: 'Adventure',
      subcategories: ['Water Sports', 'Zip-lining', 'Rock Climbing', 'Bungee Jumping', 'Skydiving'],
      interests: ['adventure', 'adrenaline', 'sports', 'extreme', 'active']
    },
    {
      name: 'Entertainment',
      subcategories: ['Concerts', 'Live Shows', 'Nightlife', 'Theme Parks', 'Events'],
      interests: ['entertainment', 'nightlife', 'shows', 'fun', 'music']
    },
    {
      name: 'Shopping',
      subcategories: ['Local Markets', 'Shopping Districts', 'Boutiques', 'Souvenir Shops', 'Malls'],
      interests: ['shopping', 'markets', 'local products', 'souvenirs']
    },
    {
      name: 'Relaxation',
      subcategories: ['Spas', 'Wellness', 'Beaches', 'Parks', 'Meditation'],
      interests: ['relaxation', 'wellness', 'spa', 'peaceful', 'mindfulness']
    }
  ];
  
  // Calculate how many activities to generate
  // We want 3-5 activities per day, plus some extra options
  const numActivities = Math.min(50, tripDuration * 4 + 10);
  
  // First, create at least one activity for each user interest
  const userInterests = interests.length > 0 ? interests : ['history', 'food', 'culture', 'nature'];
  
  for (let i = 0; i < userInterests.length && i < categories.length; i++) {
    const interest = userInterests[i].toLowerCase();
    
    // Find matching category for this interest
    const matchingCategories = categories.filter(category => 
      category.interests.some(catInterest => catInterest.includes(interest) || interest.includes(catInterest))
    );
    
    if (matchingCategories.length > 0) {
      // Pick one matching category
      const categoryIndex = (seed + i) % matchingCategories.length;
      const category = matchingCategories[categoryIndex];
      
      // Generate an activity for this category and interest
      activities.push(
        generateActivity(city, category.name, category.subcategories, seed + i * 100, interest)
      );
    }
  }
  
  // Fill remaining activities with a mix of categories
  let remainingActivities = numActivities - activities.length;
  
  for (let i = 0; i < remainingActivities; i++) {
    const categoryIndex = (seed + i + activities.length) % categories.length;
    const category = categories[categoryIndex];
    
    // Generate activity
    activities.push(
      generateActivity(city, category.name, category.subcategories, seed + (i + activities.length) * 100)
    );
  }
  
  // Sort by rating (highest first) and then by price (lowest first)
  return activities.sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return a.price - b.price;
  });
}

/**
 * Generate a single activity
 */
function generateActivity(
  city: string,
  category: string,
  subcategories: string[],
  seed: number,
  interest?: string
): Activity {
  // Pick a subcategory
  const subcategoryIndex = seed % subcategories.length;
  const subcategory = subcategories[subcategoryIndex];
  
  // Generate activity name based on category and subcategory
  const name = generateActivityName(city, category, subcategory, seed);
  
  // Generate duration (1 to 6 hours, in 30-minute increments)
  const durationHours = Math.max(1, (seed % 10) % 6);
  const durationMinutes = ((seed + 3) % 2) * 30;
  const duration = durationMinutes > 0 
    ? `${durationHours} hours ${durationMinutes} minutes` 
    : `${durationHours} hours`;
  
  // Generate price (range depends on category and duration)
  const basePrice = getBaseActivityPrice(category, durationHours);
  const priceVariability = 0.8 + ((seed % 40) / 100); // 0.8 to 1.2
  const price = Math.round(basePrice * priceVariability);
  
  // Generate rating (3.5 to 5.0)
  const rating = 3.5 + (seed % 30) / 20; // 3.5 to 5.0
  
  // Generate review count (more popular activities have more reviews)
  const baseReviewCount = 50;
  const reviewMultiplier = Math.max(1, Math.floor(rating - 3) * 3);
  const reviewCount = baseReviewCount + (seed % 150) * reviewMultiplier;
  
  // Generate description
  const description = generateActivityDescription(name, city, subcategory, duration);
  
  // Generate location and address
  const locations = [
    `${city} Downtown`,
    `${city} Historical District`,
    `Central ${city}`,
    `${subcategory} District`,
    `${city} ${subcategory} Center`,
    `${city} Waterfront`,
    `${city} Park Area`,
    `${city} Cultural Zone`
  ];
  const locationIndex = seed % locations.length;
  const location = locations[locationIndex];
  
  const streetNumber = 100 + (seed % 900);
  const streetNames = [
    'Main', 'Park', 'Grand', 'Museum', 'Festival',
    'Cultural', 'Market', 'Historic', 'Art', 'Central'
  ];
  const streetIndex = (seed + 5) % streetNames.length;
  const streetName = streetNames[streetIndex];
  const address = `${streetNumber} ${streetName} Street, ${city}`;
  
  // Generate tags based on category, subcategory, and interest
  const tags = [category.toLowerCase(), subcategory.toLowerCase()];
  if (interest) {
    tags.push(interest.toLowerCase());
  }
  
  // Add more tags based on the activity type
  const additionalTags = [
    'top-rated', 'popular', 'must-see', 'authentic', 'local experience',
    'family-friendly', 'educational', 'unique', 'traditional', 'Instagram-worthy'
  ];
  
  for (let i = 0; i < 3; i++) {
    const tagIndex = (seed + i * 7) % additionalTags.length;
    tags.push(additionalTags[tagIndex]);
  }
  
  // Generate suitable for information
  const suitableForOptions = [
    'Families', 'Couples', 'Solo travelers', 'Groups', 'Seniors',
    'Children', 'Photography enthusiasts', 'History buffs', 'Art lovers', 'Foodies'
  ];
  
  const suitableFor = [];
  const numSuitableOptions = 2 + (seed % 3);
  
  for (let i = 0; i < numSuitableOptions; i++) {
    const optionIndex = (seed + i * 13) % suitableForOptions.length;
    suitableFor.push(suitableForOptions[optionIndex]);
  }
  
  // Generate highlights
  const numHighlights = 3 + (seed % 2);
  const highlights = generateActivityHighlights(name, city, subcategory, category, numHighlights, seed);
  
  // Generate image URL
  const imageQuery = `${encodeURIComponent(subcategory)},${encodeURIComponent(city)}`;
  const imageUrl = `https://source.unsplash.com/600x400/?${imageQuery}`;
  
  // Generate distance from center
  const distance = ((seed % 30) / 10).toFixed(1);
  
  return {
    id: `activity-${seed}`,
    name,
    description,
    category,
    subcategories: [subcategory],
    location,
    address,
    city,
    price,
    currency: 'USD',
    duration,
    rating,
    reviewCount,
    imageUrl,
    bookingRequired: seed % 3 !== 0, // 2/3 chance of requiring booking
    distanceFromCenter: `${distance} km`,
    suitableFor,
    highlights,
    tags
  };
}

/**
 * Generate a realistic activity name
 */
function generateActivityName(
  city: string,
  category: string,
  subcategory: string,
  seed: number
): string {
  const prefixes = [
    `${city}`,
    `${city} Signature`,
    `${city} Ultimate`,
    `${city} Classic`,
    `Authentic ${city}`,
    `Historic ${city}`,
    `Exclusive ${city}`,
    `Top-Rated ${city}`,
    `Private ${city}`,
    `Premium ${city}`
  ];
  
  const suffixes = [
    `${subcategory} Experience`,
    `${subcategory} Adventure`,
    `${subcategory} Tour`,
    `${subcategory} Discovery`,
    `${subcategory} Exploration`,
    `${subcategory} Journey`,
    `${category} Experience`,
    `Best of ${subcategory}`,
    `${subcategory} Highlights`,
    `${subcategory} Excursion`
  ];
  
  const prefixIndex = seed % prefixes.length;
  const suffixIndex = (seed + 3) % suffixes.length;
  
  return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}`;
}

/**
 * Generate a realistic activity description
 */
function generateActivityDescription(
  name: string,
  city: string,
  subcategory: string,
  duration: string
): string {
  const introductions = [
    `Discover the best of ${city} with this ${subcategory.toLowerCase()} experience.`,
    `Immerse yourself in the ${city} ${subcategory.toLowerCase()} scene with this guided tour.`,
    `Experience ${city}'s world-renowned ${subcategory.toLowerCase()} in this unforgettable activity.`,
    `Explore the highlights of ${city}'s ${subcategory.toLowerCase()} with expert local guides.`,
    `Enjoy an authentic ${city} experience with this top-rated ${subcategory.toLowerCase()} tour.`
  ];
  
  const midsections = [
    `This ${duration} adventure takes you through the most iconic spots and hidden gems.`,
    `With a duration of ${duration}, you'll have plenty of time to enjoy the experience without rushing.`,
    `Over the course of ${duration}, you'll see why ${city} is famous for its ${subcategory.toLowerCase()}.`,
    `This carefully designed ${duration} tour offers the perfect balance of information and enjoyment.`,
    `For ${duration}, our experienced guides will share fascinating insights and stories about ${city}.`
  ];
  
  const conclusions = [
    `Perfect for first-time visitors and returning travelers alike.`,
    `An essential experience for anyone wanting to truly understand ${city}.`,
    `Book early to secure your spot - this is one of our most popular activities!`,
    `Suitable for all ages and interests, making it a perfect addition to any itinerary.`,
    `By the end, you'll have memories and photos to cherish for years to come.`
  ];
  
  const seed = hashString(name);
  
  const introIndex = seed % introductions.length;
  const midIndex = (seed + 7) % midsections.length;
  const conclusionIndex = (seed + 13) % conclusions.length;
  
  return `${introductions[introIndex]} ${midsections[midIndex]} ${conclusions[conclusionIndex]}`;
}

/**
 * Generate realistic highlights for an activity
 */
function generateActivityHighlights(
  name: string,
  city: string,
  subcategory: string,
  category: string,
  count: number,
  seed: number
): string[] {
  const highlightOptions = [
    `Experience the best of ${city}'s ${subcategory.toLowerCase()}`,
    `Learn about the rich history of ${city} from expert guides`,
    `Skip-the-line access to popular attractions`,
    `Small group sizes for a more personalized experience`,
    `Convenient pickup and drop-off at central locations`,
    `Discover hidden gems not found in guidebooks`,
    `Sample local delicacies and specialties`,
    `Take stunning photos at the best viewpoints`,
    `Receive insider tips and recommendations for the rest of your stay`,
    `Flexible booking options with free cancellation`,
    `Environmentally conscious and sustainable tour practices`,
    `Authentic interactions with local communities`,
    `Access to exclusive locations not open to the general public`,
    `All entrance fees and equipment included in the price`,
    `Digital souvenir package with professional photos`,
    `Support local businesses and artisans`
  ];
  
  const highlights: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const optionIndex = (seed + i * 17) % highlightOptions.length;
    if (!highlights.includes(highlightOptions[optionIndex])) {
      highlights.push(highlightOptions[optionIndex]);
    } else {
      // If we already selected this highlight, create a custom one
      highlights.push(`Enjoy the unique ${category.toLowerCase()} culture of ${city}`);
    }
  }
  
  return highlights;
}

/**
 * Get base price for activity based on category and duration
 */
function getBaseActivityPrice(category: string, durationHours: number): number {
  const categoryMultiplier = {
    'Sightseeing': 1.0,
    'Cultural': 1.2,
    'Food & Drink': 1.5,
    'Nature & Outdoors': 0.9,
    'Adventure': 1.8,
    'Entertainment': 1.7,
    'Shopping': 0.5,
    'Relaxation': 1.4
  }[category] || 1.0;
  
  // Base price is $20 per hour, adjusted by category
  return Math.round(20 * durationHours * categoryMultiplier);
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