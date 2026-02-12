import { NextRequest, NextResponse } from 'next/server';

function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
  
  if (originsEnv) {
    
    return originsEnv.split(',').map(origin => origin.trim());
  }

  
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
}

function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  
  for (const allowed of allowedOrigins) {
    if (allowed === '*') {
      return true;
    }

    
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      if (origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

export interface CORSOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

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
  maxAge: 86400 
};

export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  options: CORSOptions = {}
): NextResponse {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };
  const origin = request.headers.get('origin');

  
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return response;
}

export function handleCORSPreflight(
  request: NextRequest,
  options: CORSOptions = {}
): NextResponse {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };
  const origin = request.headers.get('origin');

  
  const response = new NextResponse(null, { status: 204 });

  
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    
    return new NextResponse(null, { status: 403 });
  }

  
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  return response;
}

export async function withCORS(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: CORSOptions = {}
): Promise<NextResponse> {
  
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request, options);
  }

  
  try {
    const response = await handler();
    return applyCORSHeaders(request, response, options);
  } catch (error) {
    
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

export function createCORSResponse(
  request: NextRequest,
  data: any,
  status: number = 200,
  options: CORSOptions = {}
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applyCORSHeaders(request, response, options);
}

export function corsMiddleware(
  request: NextRequest,
  options: CORSOptions = {}
): NextResponse | null {
  
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request, options);
  }

  
  
  return null;
}

export function validateCORSConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allowedOrigins = getAllowedOrigins();

  
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
