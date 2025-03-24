import { NextRequest, NextResponse } from 'next/server';
import { wisp } from '@/lib/wisp';
import { listDirectoryListings } from '@/app/lib/directoryDb';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for search parameters
const searchParamsSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'blog', 'directory']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  sort: z.enum(['relevance', 'date', 'title']).optional().default('relevance')
});

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  try {
    // Parse and validate search parameters
    const { searchParams } = new URL(request.url);
    const validationResult = searchParamsSchema.safeParse({
      q: searchParams.get('q'),
      type: searchParams.get('type') || 'all',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      sort: searchParams.get('sort') || 'relevance'
    });

    if (!validationResult.success) {
      logger.warn('Invalid search parameters', {
        requestId,
        errors: validationResult.error.format(),
      });
      
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { q: query, type, limit, page, sort } = validationResult.data;
    
    logger.info('Processing search request', {
      requestId,
      query,
      type,
      limit,
      page,
      sort
    });

    let blogResults = [];
    let directoryResults = [];

    // Search blog posts
    if (type === 'all' || type === 'blog') {
      try {
        logger.debug('Searching blog posts', { requestId, query });
        const blogResponse = await wisp.getPosts({ 
          query,
          limit,
          page,
          // Map 'sort' to appropriate wisp sort params if needed
        });
        blogResults = blogResponse.posts || [];
        logger.debug('Blog search results', { 
          requestId, 
          count: blogResults.length 
        });
      } catch (error) {
        logger.error('Error searching blog posts', error as Error, {
          requestId,
          query
        });
        // Continue execution to try directory search
      }
    }

    // Search directory listings
    if (type === 'all' || type === 'directory') {
      try {
        logger.debug('Searching directory listings', { requestId, query });
        const directoryResponse = await listDirectoryListings({
          search: query,
          limit,
          page,
          // Map 'sort' to appropriate directory sort params if needed
        });
        directoryResults = directoryResponse.listings || [];
        logger.debug('Directory search results', { 
          requestId, 
          count: directoryResults.length 
        });
      } catch (error) {
        logger.error('Error searching directory listings', error as Error, {
          requestId,
          query
        });
        // Continue execution to return any blog results
      }
    }

    // Format the response
    const totalResults = blogResults.length + directoryResults.length;
    const response = {
      query,
      results: {
        total: totalResults,
        blog: {
          items: blogResults,
          count: blogResults.length
        },
        directory: {
          items: directoryResults,
          count: directoryResults.length
        }
      },
      pagination: {
        page,
        limit,
        hasMore: totalResults === limit // This is a simplification, proper pagination would need more info
      },
      meta: {
        processingTimeMs: Math.round(performance.now() - startTime),
        requestId
      }
    };

    logger.info('Search completed successfully', {
      requestId,
      query,
      totalResults,
      processingTimeMs: Math.round(performance.now() - startTime)
    });

    return NextResponse.json(response);
  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);
    logger.error('Unexpected error in search API', error as Error, {
      requestId,
      processingTimeMs: processingTime
    });
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while processing your search',
        requestId,
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
} 