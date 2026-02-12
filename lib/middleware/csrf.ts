/**
 * CSRF Protection Middleware
 * Protects state-changing API endpoints from cross-site request forgery
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export interface CSRFConfig {
  cookieName?: string;
  headerName?: string;
  maxAge?: number; // seconds
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const defaultConfig: CSRFConfig = {
  cookieName: CSRF_TOKEN_COOKIE,
  headerName: CSRF_HEADER,
  maxAge: 3600, // 1 hour
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Use timing-safe comparison
  try {
    const cookieHash = createHash('sha256').update(cookieToken).digest('hex');
    const headerHash = createHash('sha256').update(headerToken).digest('hex');
    return cookieHash === headerHash;
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: CSRFConfig = {}
): (req: NextRequest) => Promise<NextResponse> {
  const opts = { ...defaultConfig, ...config };
  
  return async (request: NextRequest) => {
    // Safe methods don't require CSRF protection
    if (CSRF_SAFE_METHODS.includes(request.method)) {
      return handler(request);
    }
    
    // Get tokens from cookie and header
    const cookieToken = request.cookies.get(opts.cookieName!)?.value;
    const headerToken = request.headers.get(opts.headerName!) || undefined;
    
    // Validate tokens
    if (!validateCSRFToken(cookieToken, headerToken)) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF validation failed',
          details: 'Invalid or missing CSRF token',
        },
        { status: 403 }
      );
    }
    
    return handler(request);
  };
}

/**
 * Generate CSRF token response for client
 */
export function generateCSRFResponse(): NextResponse {
  const token = generateCSRFToken();
  
  const response = NextResponse.json({
    success: true,
    csrfToken: token,
  });
  
  // Set CSRF token cookie
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
    path: '/',
  });
  
  return response;
}

/**
 * Refresh CSRF token
 */
export function refreshCSRFToken(request: NextRequest): NextResponse {
  const newToken = generateCSRFToken();
  
  const response = NextResponse.json({
    success: true,
    csrfToken: newToken,
  });
  
  response.cookies.set(CSRF_TOKEN_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
    path: '/',
  });
  
  return response;
}
