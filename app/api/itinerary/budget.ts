import { Itinerary, Day, Activity } from './utils';

/**
 * Optimize the budget allocation for the itinerary based on user preferences
 * and budget constraints
 */
export async function optimizeBudget(itinerary: Itinerary, totalBudget: number): Promise<Itinerary> {
  try {
    // Parse the current total cost
    const currentCost = parseCurrency(itinerary.totalCost);
    
    // If the itinerary is already under budget, no optimization needed
    if (currentCost <= totalBudget) {
      return itinerary;
    }
    
    // Calculate how much we need to save
    const savingsNeeded = currentCost - totalBudget;
    
    // Make a deep copy of the itinerary to avoid modifying the original
    const optimizedItinerary = JSON.parse(JSON.stringify(itinerary)) as Itinerary;
    
    // Analyze budget allocation
    const budgetBreakdown = analyzeBudgetAllocation(optimizedItinerary);
    
    // Optimize based on spending categories
    if (budgetBreakdown.accommodation > budgetBreakdown.activities && 
        budgetBreakdown.accommodation > budgetBreakdown.transportation) {
      // Accommodation is the highest expense, optimize it first
      optimizeAccommodation(optimizedItinerary.days, savingsNeeded, budgetBreakdown.accommodation);
    } else if (budgetBreakdown.activities > budgetBreakdown.transportation) {
      // Activities are the highest expense, optimize them first
      optimizeActivities(optimizedItinerary.days, savingsNeeded, budgetBreakdown.activities);
    } else {
      // Transportation is the highest expense, optimize it first
      optimizeTransportation(optimizedItinerary.days, savingsNeeded, budgetBreakdown.transportation);
    }
    
    // Recalculate the total cost
    const newTotalCost = calculateTotalCost(optimizedItinerary.days);
    optimizedItinerary.totalCost = formatCurrency(newTotalCost);
    
    // Add budget-friendly alternative activities
    addBudgetAlternatives(optimizedItinerary.days);
    
    return optimizedItinerary;
  } catch (error) {
    console.error('Error optimizing budget:', error);
    return itinerary; // Return original itinerary if optimization fails
  }
}

/**
 * Analyze how the budget is allocated across different categories
 */
function analyzeBudgetAllocation(itinerary: Itinerary): {
  accommodation: number;
  activities: number;
  transportation: number;
} {
  let accommodationTotal = 0;
  let activitiesTotal = 0;
  let transportationTotal = 0;
  
  itinerary.days.forEach(day => {
    // Add accommodation costs
    accommodationTotal += parseCurrency(day.accommodation.cost);
    
    // Add transportation costs
    transportationTotal += parseCurrency(day.transportation.cost);
    
    // Add activity costs
    day.activities.forEach(activity => {
      activitiesTotal += parseCurrency(activity.cost);
    });
  });
  
  return {
    accommodation: accommodationTotal,
    activities: activitiesTotal,
    transportation: transportationTotal
  };
}

/**
 * Optimize accommodation costs to meet budget constraints
 */
function optimizeAccommodation(days: Day[], savingsNeeded: number, totalAccommodationCost: number): void {
  // Calculate percentage reduction needed
  const reductionPercentage = Math.min(savingsNeeded / totalAccommodationCost, 0.5); // Max 50% reduction
  
  // Apply reduction to each day's accommodation
  days.forEach(day => {
    const currentCost = parseCurrency(day.accommodation.cost);
    const reducedCost = currentCost * (1 - reductionPercentage);
    day.accommodation.cost = formatCurrency(reducedCost);
  });
}

/**
 * Optimize activity costs to meet budget constraints
 */
function optimizeActivities(days: Day[], savingsNeeded: number, totalActivitiesCost: number): void {
  // Calculate percentage reduction needed
  const reductionPercentage = Math.min(savingsNeeded / totalActivitiesCost, 0.4); // Max 40% reduction
  
  // Apply reduction to each activity, prioritizing expensive ones
  days.forEach(day => {
    // Sort activities by cost, highest first
    const sortedActivities = [...day.activities].sort((a, b) => 
      parseCurrency(b.cost) - parseCurrency(a.cost)
    );
    
    // Apply higher reduction to most expensive activities
    sortedActivities.forEach((activity, index) => {
      const currentCost = parseCurrency(activity.cost);
      // Apply higher reduction to expensive activities
      const adjustedReduction = reductionPercentage * (1 + (index === 0 ? 0.2 : 0));
      const reducedCost = currentCost * (1 - adjustedReduction);
      
      // Update the original activity in the day
      const originalIndex = day.activities.findIndex(a => a.name === activity.name);
      if (originalIndex !== -1) {
        day.activities[originalIndex].cost = formatCurrency(reducedCost);
      }
    });
  });
}

/**
 * Optimize transportation costs to meet budget constraints
 */
function optimizeTransportation(days: Day[], savingsNeeded: number, totalTransportationCost: number): void {
  // Calculate percentage reduction needed
  const reductionPercentage = Math.min(savingsNeeded / totalTransportationCost, 0.45); // Max 45% reduction
  
  // Apply reduction to each day's transportation
  days.forEach(day => {
    const currentCost = parseCurrency(day.transportation.cost);
    const reducedCost = currentCost * (1 - reductionPercentage);
    day.transportation.cost = formatCurrency(reducedCost);
  });
}

/**
 * Add budget-friendly alternative activities to each day
 */
function addBudgetAlternatives(days: Day[]): void {
  days.forEach(day => {
    // Create alternative activities for each day
    const alternatives: Activity[] = day.activities.map(activity => {
      const currentCost = parseCurrency(activity.cost);
      const reducedCost = currentCost * 0.6; // 40% cheaper alternative
      
      return {
        ...activity,
        name: `Budget ${activity.name}`,
        description: `A more affordable version of ${activity.name}.`,
        cost: formatCurrency(reducedCost),
        type: activity.type,
        location: activity.location,
        duration: activity.duration,
      };
    });
    
    // Add alternatives to the day
    day.alternativeActivities = alternatives;
  });
}

/**
 * Calculate the total cost of the itinerary
 */
function calculateTotalCost(days: Day[]): number {
  let total = 0;
  
  days.forEach(day => {
    // Add accommodation cost
    total += parseCurrency(day.accommodation.cost);
    
    // Add transportation cost
    total += parseCurrency(day.transportation.cost);
    
    // Add activity costs
    day.activities.forEach(activity => {
      total += parseCurrency(activity.cost);
    });
  });
  
  return total;
}

/**
 * Parse a currency string to a number
 */
function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and commas, then parse
  const numericString = currencyString.replace(/[$,€£¥]/g, '').trim();
  return parseFloat(numericString) || 0;
}

/**
 * Format a number as a currency string
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
} 