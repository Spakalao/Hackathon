import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// In a production environment, this would use a real LLM API
// For the hackathon, we'll simulate AI-generated itineraries
function generateMockItinerary(destination: string, startDate: string, endDate: string, budget: number, preferences: any) {
  // Calculate number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
  
  // Adjust budget per day based on destination
  let baseDailyCost = 100; // Default
  
  if (destination.toLowerCase().includes('paris') || 
      destination.toLowerCase().includes('london') || 
      destination.toLowerCase().includes('tokyo')) {
    baseDailyCost = 150; // More expensive cities
  } else if (destination.toLowerCase().includes('bangkok') || 
             destination.toLowerCase().includes('mexico') || 
             destination.toLowerCase().includes('bali')) {
    baseDailyCost = 70; // More affordable destinations
  }
  
  // Adjust for preferences
  if (preferences) {
    if (preferences.accommodationType === 'luxury') {
      baseDailyCost += 100;
    } else if (preferences.accommodationType === 'budget') {
      baseDailyCost -= 30;
    }
    
    if (preferences.transportationPreference === 'rental') {
      baseDailyCost += 40;
    }
    
    if (preferences.mealPreference === 'fine dining') {
      baseDailyCost += 50;
    } else if (preferences.mealPreference === 'street food') {
      baseDailyCost -= 20;
    }
  }
  
  // Generate activities based on destination
  const activities = generateActivities(destination);
  
  // Generate accommodations
  const accommodations = generateAccommodations(destination, preferences?.accommodationType || 'standard');
  
  // Generate daily itineraries
  const days = [];
  let totalCost = 0;
  
  for (let i = 0; i < durationDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    // Pick random activities for the day (2-4 activities)
    const numActivities = Math.floor(Math.random() * 3) + 2;
    const dayActivities = [];
    let dayCost = 0;
    
    // Select accommodation for the day
    const accommodation = accommodations[i % accommodations.length];
    dayCost += parseFloat(accommodation.cost.replace('$', ''));
    
    // Generate transportation for the day
    const transportation = generateTransportation(preferences?.transportationPreference || 'public');
    dayCost += parseFloat(transportation.cost.replace('$', ''));
    
    // Pick activities
    for (let j = 0; j < numActivities; j++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      dayActivities.push(activity);
      dayCost += parseFloat(activity.cost.replace('$', ''));
    }
    
    days.push({
      date: currentDate.toISOString().split('T')[0],
      activities: dayActivities,
      accommodation,
      transportation
    });
    
    totalCost += dayCost;
  }
  
  // Generate travel tips
  const travelTips = generateTravelTips(destination);
  
  // Ensure total cost is within budget or explain overage
  let budgetMessage = '';
  if (totalCost > budget) {
    budgetMessage = `Note: This itinerary exceeds your budget by $${(totalCost - budget).toFixed(2)}. Consider adjusting preferences or duration.`;
    travelTips.unshift(budgetMessage);
  } else {
    budgetMessage = `Good news! This itinerary is within your budget with $${(budget - totalCost).toFixed(2)} to spare.`;
    travelTips.unshift(budgetMessage);
  }
  
  return {
    destination,
    totalCost: `$${totalCost.toFixed(2)}`,
    duration: `${durationDays} days`,
    budgetMessage,
    days,
    travelTips
  };
}

// Helper function to generate activities based on destination
function generateActivities(destination: string) {
  const commonActivities = [
    {
      name: 'Local Market Visit',
      description: 'Explore the vibrant local market to sample fresh produce and regional specialties',
      cost: '$10',
      type: 'Cultural',
      location: 'City Center',
      duration: '2 hours'
    },
    {
      name: 'Historical Walking Tour',
      description: 'Take a guided walking tour through historical districts',
      cost: '$20',
      type: 'Sightseeing',
      location: 'Old Town',
      duration: '3 hours'
    },
    {
      name: 'Local Museum',
      description: 'Visit the main museum to learn about local history and culture',
      cost: '$15',
      type: 'Cultural',
      location: 'Museum District',
      duration: '2 hours'
    }
  ];
  
  // Custom activities based on destination
  const destinationActivities: Record<string, any[]> = {
    paris: [
      {
        name: 'Eiffel Tower Visit',
        description: 'Visit the iconic Eiffel Tower',
        cost: '$25',
        type: 'Sightseeing',
        location: 'Champ de Mars',
        duration: '3 hours'
      },
      {
        name: 'Louvre Museum',
        description: 'Explore one of the world\'s largest art museums',
        cost: '$17',
        type: 'Cultural',
        location: 'Rue de Rivoli',
        duration: '4 hours'
      },
      {
        name: 'Seine River Cruise',
        description: 'Enjoy a relaxing cruise along the Seine River',
        cost: '$15',
        type: 'Leisure',
        location: 'Seine River',
        duration: '1 hour'
      }
    ],
    tokyo: [
      {
        name: 'Meiji Shrine',
        description: 'Visit the serene Meiji Shrine and its surrounding forest',
        cost: '$0',
        type: 'Cultural',
        location: 'Shibuya',
        duration: '2 hours'
      },
      {
        name: 'Tsukiji Outer Market',
        description: 'Explore the food stalls and shops at the famous market',
        cost: '$20',
        type: 'Food',
        location: 'Tsukiji',
        duration: '3 hours'
      },
      {
        name: 'Tokyo Skytree',
        description: 'Enjoy panoramic views of Tokyo from one of the tallest towers',
        cost: '$30',
        type: 'Sightseeing',
        location: 'Sumida',
        duration: '2 hours'
      }
    ],
    barcelona: [
      {
        name: 'Sagrada Familia',
        description: 'Marvel at Gaudi\'s unfinished masterpiece',
        cost: '$27',
        type: 'Sightseeing',
        location: 'Eixample',
        duration: '2 hours'
      },
      {
        name: 'Park Güell',
        description: 'Explore the colorful park designed by Antoni Gaudi',
        cost: '$10',
        type: 'Outdoor',
        location: 'Carmel Hill',
        duration: '2 hours'
      },
      {
        name: 'La Boqueria Market',
        description: 'Wander through this famous public market',
        cost: '$0',
        type: 'Food',
        location: 'Las Ramblas',
        duration: '1 hour'
      }
    ]
  };
  
  // Determine which destination-specific activities to include
  let activities = [...commonActivities];
  
  for (const [key, value] of Object.entries(destinationActivities)) {
    if (destination.toLowerCase().includes(key)) {
      activities = [...activities, ...value];
      break;
    }
  }
  
  // If no specific destination matched, add generic activities
  if (activities.length <= commonActivities.length) {
    activities.push(
      {
        name: 'City Viewpoint',
        description: 'Visit the best viewpoint to see panoramic views of the city',
        cost: '$5',
        type: 'Sightseeing',
        location: 'City Outskirts',
        duration: '1 hour'
      },
      {
        name: 'Local Food Tour',
        description: 'Sample the best local dishes on a guided food tour',
        cost: '$35',
        type: 'Food',
        location: 'Various Locations',
        duration: '3 hours'
      }
    );
  }
  
  return activities;
}

// Helper function to generate accommodations
function generateAccommodations(destination: string, type: string) {
  const accommodations = [];
  
  // Base accommodation options based on type
  if (type === 'luxury') {
    accommodations.push({
      name: 'Luxury Hotel & Spa',
      location: 'City Center',
      cost: '$250'
    });
  } else if (type === 'budget') {
    accommodations.push({
      name: 'Budget Hostel',
      location: 'Near City Center',
      cost: '$40'
    });
  } else {
    accommodations.push({
      name: 'Comfort Hotel',
      location: 'Downtown',
      cost: '$120'
    });
  }
  
  // Add destination-specific accommodations
  if (destination.toLowerCase().includes('paris')) {
    if (type === 'luxury') {
      accommodations.push({
        name: 'Grand Hôtel de Paris',
        location: 'Champs-Élysées',
        cost: '$280'
      });
    } else if (type === 'budget') {
      accommodations.push({
        name: 'Montmartre Hostel',
        location: 'Montmartre',
        cost: '$45'
      });
    } else {
      accommodations.push({
        name: 'Le Petit Hôtel',
        location: 'Latin Quarter',
        cost: '$140'
      });
    }
  } else if (destination.toLowerCase().includes('tokyo')) {
    if (type === 'luxury') {
      accommodations.push({
        name: 'Tokyo Imperial Hotel',
        location: 'Ginza',
        cost: '$300'
      });
    } else if (type === 'budget') {
      accommodations.push({
        name: 'Asakusa Capsule Hotel',
        location: 'Asakusa',
        cost: '$35'
      });
    } else {
      accommodations.push({
        name: 'Shibuya Hotel East',
        location: 'Shibuya',
        cost: '$150'
      });
    }
  }
  
  return accommodations;
}

// Helper function to generate transportation
function generateTransportation(preference: string) {
  if (preference === 'rental') {
    return {
      type: 'Car Rental',
      details: 'Economy class car',
      cost: '$45'
    };
  } else if (preference === 'taxi') {
    return {
      type: 'Taxi Service',
      details: 'On-demand taxi',
      cost: '$30'
    };
  } else {
    return {
      type: 'Public Transport',
      details: 'Day pass',
      cost: '$10'
    };
  }
}

// Helper function to generate travel tips
function generateTravelTips(destination: string) {
  const commonTips = [
    'Always keep a digital copy of your travel documents',
    'Check the weather forecast before heading out each day',
    'Learn a few basic phrases in the local language',
    'Keep emergency contact numbers saved in your phone'
  ];
  
  const destinationTips: Record<string, string[]> = {
    paris: [
      'Visit museums on first Sunday for free entry',
      'Buy metro tickets in bulk to save money',
      'Many restaurants offer fixed-price lunch menus that are cheaper than dinner'
    ],
    tokyo: [
      'Get a Suica or Pasmo card for easy public transportation',
      'Many restaurants have vending machines for ordering to avoid language barriers',
      'Convenience stores (konbini) offer affordable and good quality meals'
    ],
    barcelona: [
      'Watch out for pickpockets in tourist areas',
      'Many attractions offer online tickets to skip the line',
      'Locals eat dinner much later, around 9-10pm'
    ]
  };
  
  // Determine which destination-specific tips to include
  let tips = [...commonTips];
  
  for (const [key, value] of Object.entries(destinationTips)) {
    if (destination.toLowerCase().includes(key)) {
      tips = [...tips, ...value];
      break;
    }
  }
  
  // If no specific destination matched, add generic tips
  if (tips.length <= commonTips.length) {
    tips.push(
      'Research local customs before your trip',
      'Try to eat where locals eat for authentic cuisine',
      'Consider buying a local SIM card for data access'
    );
  }
  
  return tips;
}

// Generate itinerary
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.endDate) {
      return NextResponse.json(
        { error: 'End date is required' },
        { status: 400 }
      );
    }
    
    const { destination, startDate, endDate, budget = 1000, preferences = {} } = requestData;
    
    // In a real app, this is where you would call an AI service
    // For the hackathon, generate a mock itinerary
    const itinerary = generateMockItinerary(destination, startDate, endDate, budget, preferences);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return NextResponse.json({
      itinerary,
      message: 'Itinerary generated successfully'
    });
  } catch (error) {
    console.error('Generate itinerary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
} 