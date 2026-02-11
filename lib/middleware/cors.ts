import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS middleware for API endpoints
 * Configures allowed origins from environment variables
 * Adds CORS headers to all API responses
 * 
 * Validates: Requirements 7.5, 10.7
 */

/**
 * Get allowed origins from environment variables
 * Defaults to localhost for development
 */
function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
  
  if (originsEnv) {
    // Parse comma-separated list of origins
    return originsEnv.split(',').map(origin => origin.trim());
  }

  // Default allowed origins for development
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  // Check for exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check for wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed === '*') {
      return true;
    }

    // Support wildcard subdomains (e.g., *.example.com)
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      if (origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * CORS configuration options
 */
export interface CORSOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration
 */
const DEFAULT_CORS_OPTIONS: Required<CORSOptions> = {
  allowedOrigins: getAllowedOrigins(),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-Id'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * Apply CORS headers to a response
 */
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  options: CORSOptions = {}
): NextResponse {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return response;
}

/**
 * Handle CORS preflight requests (OPTIONS)
 */
export function handleCORSPreflight(
  request: NextRequest,
  options: CORSOptions = {}
): NextResponse {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };
  const origin = request.headers.get('origin');

  // Create response for preflight
  const response = new NextResponse(null, { status: 204 });

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    // Origin not allowed
    return new NextResponse(null, { status: 403 });
  }

  // Set preflight headers
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return response;
}

/**
 * CORS middleware wrapper for API routes
 * Automatically handles preflight requests and adds CORS headers
 * 
 * Usage:
 * export async function POST(request: NextRequest) {
 *   return withCORS(request, async () => {
 *     // Your API logic here
 *     return NextResponse.json({ success: true });
 *   });
 * }
 */
export async function withCORS(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: CORSOptions = {}
): Promise<NextResponse> {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request, options);
  }

  // Execute handler and add CORS headers to response
  try {
    const response = await handler();
    return applyCORSHeaders(request, response, options);
  } catch (error) {
    // Even error responses should have CORS headers
    const errorResponse = NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
    return applyCORSHeaders(request, errorResponse, options);
  }
}

/**
 * Create a CORS-enabled response
 * Helper function to create responses with CORS headers
 */
export function createCORSResponse(
  request: NextRequest,
  data: any,
  status: number = 200,
  options: CORSOptions = {}
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applyCORSHeaders(request, response, options);
}

/**
 * Middleware to add CORS headers to all API routes
 * Can be used in middleware.ts for global CORS handling
 */
export function corsMiddleware(
  request: NextRequest,
  options: CORSOptions = {}
): NextResponse | null {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request, options);
  }

  // For other methods, return null to continue to the route handler
  // The route handler should use withCORS or applyCORSHeaders
  return null;
}

/**
 * Validate CORS configuration
 * Ensures environment variables are properly set
 */
export function validateCORSConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allowedOrigins = getAllowedOrigins();

  // Check if using default origins in production
  if (process.env.NODE_ENV === 'production') {
    const hasDefaultOrigins = allowedOrigins.some(origin => 
      origin.includes('localhost') || origin.includes('127.0.0.1')
    );

    if (hasDefaultOrigins) {
      warnings.push('Using default localhost origins in production. Set ALLOWED_ORIGINS environment variable.');
    }

    if (allowedOrigins.includes('*')) {
      warnings.push('Using wildcard (*) origin in production. This allows any origin and may be a security risk.');
    }
  }

  // Check if origins are valid URLs
  for (const origin of allowedOrigins) {
    if (origin === '*') continue;
    if (origin.startsWith('*.')) continue;

    try {
      new URL(origin);
    } catch {
      errors.push(`Invalid origin URL: ${origin}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get current CORS configuration
 * Useful for debugging and monitoring
 */
export function getCORSConfig(): {
  allowedOrigins: string[];
  environment: string;
  validation: ReturnType<typeof validateCORSConfig>;
} {
  return {
    allowedOrigins: getAllowedOrigins(),
    environment: process.env.NODE_ENV || 'development',
    validation: validateCORSConfig()
  };
}
