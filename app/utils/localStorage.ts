/**
 * Local Storage Utility
 * 
 * This module provides helper functions to store and retrieve data from localStorage.
 * For a hackathon project, this is a simple and effective way to persist user data without setting up a database.
 */

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: 'btc_user_preferences',
  SAVED_TRIPS: 'btc_saved_trips',
  RECENT_SEARCHES: 'btc_recent_searches',
  THEME: 'btc_theme',
};

// Maximum number of items to store
const MAX_SAVED_TRIPS = 10;
const MAX_RECENT_SEARCHES = 5;

// Type definitions
export type UserPreferences = {
  name?: string;
  homeLocation?: string;
  currency?: string;
  travelStyle?: string[];
  accommodationType?: string[];
  budget?: {
    min: number;
    max: number;
  };
  interests?: string[];
};

export type SavedTrip = {
  id: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  budget: string;
  createdAt: string;
  itinerary: any; // Store the full itinerary object
};

export type RecentSearch = {
  id: string;
  query: string;
  timestamp: string;
};

/**
 * User Preferences
 */

// Get user preferences from localStorage
export const getUserPreferences = (): UserPreferences | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting user preferences from localStorage:', error);
    return null;
  }
};

// Save user preferences to localStorage
export const saveUserPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences to localStorage:', error);
  }
};

/**
 * Saved Trips
 */

// Get saved trips from localStorage
export const getSavedTrips = (): SavedTrip[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting saved trips from localStorage:', error);
    return [];
  }
};

// Save a trip to localStorage
export const saveTrip = (trip: SavedTrip): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedTrips = getSavedTrips();
    
    // Check if we already have this trip saved (by ID)
    const existingIndex = savedTrips.findIndex(t => t.id === trip.id);
    
    if (existingIndex >= 0) {
      // Update existing trip
      savedTrips[existingIndex] = trip;
    } else {
      // Add new trip, keeping only the most recent MAX_SAVED_TRIPS
      savedTrips.unshift(trip);
      if (savedTrips.length > MAX_SAVED_TRIPS) {
        savedTrips.pop();
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(savedTrips));
  } catch (error) {
    console.error('Error saving trip to localStorage:', error);
  }
};

// Delete a saved trip
export const deleteTrip = (tripId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedTrips = getSavedTrips();
    const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
    
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(updatedTrips));
  } catch (error) {
    console.error('Error deleting trip from localStorage:', error);
  }
};

/**
 * Recent Searches
 */

// Get recent searches from localStorage
export const getRecentSearches = (): RecentSearch[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent searches from localStorage:', error);
    return [];
  }
};

// Add a recent search to localStorage
export const addRecentSearch = (query: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const recentSearches = getRecentSearches();
    
    // Create a new search entry
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
    };
    
    // Remove any duplicate searches (same query)
    const filteredSearches = recentSearches.filter(search => 
      search.query.toLowerCase() !== query.toLowerCase()
    );
    
    // Add the new search at the beginning
    filteredSearches.unshift(newSearch);
    
    // Limit to MAX_RECENT_SEARCHES
    if (filteredSearches.length > MAX_RECENT_SEARCHES) {
      filteredSearches.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(filteredSearches));
  } catch (error) {
    console.error('Error adding recent search to localStorage:', error);
  }
};

// Clear all recent searches
export const clearRecentSearches = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  } catch (error) {
    console.error('Error clearing recent searches from localStorage:', error);
  }
};

/**
 * Theme Preferences
 */

export type ThemePreference = 'light' | 'dark' | 'system';

// Get theme from localStorage
export const getThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored as ThemePreference) || 'system';
  } catch (error) {
    console.error('Error getting theme from localStorage:', error);
    return 'system';
  }
};

// Save theme to localStorage
export const saveThemePreference = (theme: ThemePreference): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
}; 