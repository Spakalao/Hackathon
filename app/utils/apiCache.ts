/**
 * API Cache Utility
 * 
 * This module provides a simple in-memory cache for API responses.
 * It helps:
 * 1. Reduce API calls to external services
 * 2. Improve application performance
 * 3. Manage rate limits for APIs like OpenAI
 */

type CacheEntry = {
  data: any;
  timestamp: number;
  expiresAt: number;
};

// Cache storage - keys are stringified request parameters
const cache: Record<string, CacheEntry> = {};

// Default cache duration in milliseconds (1 hour)
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000;

/**
 * Generate a cache key from request parameters
 */
export const generateCacheKey = (endpoint: string, params: Record<string, any>): string => {
  // Sort params to ensure consistent key generation regardless of param order
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${endpoint}-${JSON.stringify(sortedParams)}`;
};

/**
 * Get cached response if available and not expired
 */
export const getCachedResponse = (cacheKey: string): any | null => {
  const cacheEntry = cache[cacheKey];
  
  if (!cacheEntry) {
    return null; // No cache entry found
  }
  
  const now = Date.now();
  if (now > cacheEntry.expiresAt) {
    // Cache has expired, remove it
    delete cache[cacheKey];
    return null;
  }
  
  return cacheEntry.data;
};

/**
 * Cache an API response
 */
export const cacheResponse = (
  cacheKey: string, 
  data: any, 
  duration: number = DEFAULT_CACHE_DURATION
): void => {
  const now = Date.now();
  
  cache[cacheKey] = {
    data,
    timestamp: now,
    expiresAt: now + duration
  };
  
  // Log cache size occasionally to monitor memory usage
  if (Object.keys(cache).length % 10 === 0) {
    console.log(`API Cache size: ${Object.keys(cache).length} entries`);
  }
};

/**
 * Clear cache entries older than the specified duration
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  
  Object.keys(cache).forEach(key => {
    if (now > cache[key].expiresAt) {
      delete cache[key];
    }
  });
};

/**
 * Clear the entire cache
 */
export const clearCache = (): void => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
};

/**
 * Clear cache for a specific endpoint
 */
export const clearEndpointCache = (endpoint: string): void => {
  Object.keys(cache).forEach(key => {
    if (key.startsWith(`${endpoint}-`)) {
      delete cache[key];
    }
  });
};

// Set up an interval to periodically clear expired cache entries
if (typeof window !== 'undefined') {
  // Only run in the browser
  setInterval(clearExpiredCache, 15 * 60 * 1000); // Every 15 minutes
}

/**
 * Wrapped fetch function that uses cache
 */
export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  cacheParams: Record<string, any> = {},
  cacheDuration: number = DEFAULT_CACHE_DURATION
): Promise<any> => {
  // Generate a cache key based on the URL and any cache parameters
  const cacheKey = generateCacheKey(url, cacheParams);
  
  // Check the cache first
  const cachedData = getCachedResponse(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, make the actual API request
  const response = await fetch(url, options);
  
  // Only cache successful responses
  if (response.ok) {
    const data = await response.json();
    cacheResponse(cacheKey, data, cacheDuration);
    return data;
  }
  
  // For errors, don't cache, just return the response
  return response.json();
}; 