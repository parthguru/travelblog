import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './lib/logger';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, search } = request.nextUrl;
  
  try {
    // Log the request
    logger.info('Request received', {
      method: request.method,
      path: pathname,
      query: search,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });
    
    // Allow the request to continue
    const response = NextResponse.next();
    
    // Calculate request processing time
    const processingTime = Date.now() - startTime;
    
    // Log the response
    logger.info('Response sent', {
      path: pathname,
      processingTime: `${processingTime}ms`,
      status: response.status,
    });
    
    return response;
  } catch (error) {
    // Log any errors that occur in middleware
    logger.error('Middleware error', error as Error, {
      path: pathname,
      query: search,
    });
    
    // Allow the request to continue even if there's an error in logging
    return NextResponse.next();
  }
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Apply to all paths except API routes, static files, and Next.js internals
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}; 