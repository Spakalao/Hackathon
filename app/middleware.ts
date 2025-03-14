import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you would use Redis or a similar distributed store
const rateLimitStore: Record<string, { count: number, timestamp: number }> = {};

// Rate limit config
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute
const RATE_LIMIT_OPENAI_REQUESTS = 10; // 10 AI requests per minute

// Clean up old entries periodically
const cleanupRateLimitStore = () => {
  const now = Date.now();
  
  Object.keys(rateLimitStore).forEach(key => {
    if (now - rateLimitStore[key].timestamp > RATE_LIMIT_WINDOW) {
      delete rateLimitStore[key];
    }
  });
};

// Set up periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, RATE_LIMIT_WINDOW);
}

export async function middleware(request: NextRequest) {
  // Skip middleware in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Get IP address for rate limiting
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  
  // Determine if this is an AI API route
  const isAiApiRoute = request.nextUrl.pathname.includes('/api/chat') || 
                        request.nextUrl.pathname.includes('/api/generate-plan');
  
  // Set rate limit based on route type
  const rateLimit = isAiApiRoute ? RATE_LIMIT_OPENAI_REQUESTS : RATE_LIMIT_MAX_REQUESTS;
  const rateLimitKey = `${ip}-${isAiApiRoute ? 'ai' : 'standard'}`;
  
  // Initialize or reset counter if window has elapsed
  if (!rateLimitStore[rateLimitKey] || (now - rateLimitStore[rateLimitKey].timestamp > RATE_LIMIT_WINDOW)) {
    rateLimitStore[rateLimitKey] = { count: 1, timestamp: now };
  } else {
    // Increment counter
    rateLimitStore[rateLimitKey].count++;
  }
  
  // Check if rate limit exceeded
  if (rateLimitStore[rateLimitKey].count > rateLimit) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitStore[rateLimitKey].timestamp)) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitStore[rateLimitKey].timestamp)) / 1000).toString()
        }
      }
    );
  }
  
  // Add rate limit headers to response
  const response = NextResponse.next();
  
  response.headers.set('X-RateLimit-Limit', rateLimit.toString());
  response.headers.set('X-RateLimit-Remaining', (rateLimit - rateLimitStore[rateLimitKey].count).toString());
  response.headers.set(
    'X-RateLimit-Reset', 
    (Math.ceil((rateLimitStore[rateLimitKey].timestamp + RATE_LIMIT_WINDOW) / 1000)).toString()
  );
  
  return response;
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
}; 