import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting middleware for API endpoints
 * Enforces 100 requests per minute per IP address
 * Returns HTTP 429 for exceeded limits
 * 
 * Validates: Requirements 7.2
 */

// Create rate limiter instance
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000)
    });
  }
});

/**
 * Next.js compatible rate limiting middleware
 * Wraps express-rate-limit for use in Next.js API routes
 */
export async function applyRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return new Promise((resolve) => {
    // Extract IP address from request
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Create mock express req/res objects for rate-limit library
    const req: any = {
      ip,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      url: request.url,
      rateLimit: {}
    };

    const res: any = {
      status: (code: number) => {
        res.statusCode = code;
        return res;
      },
      json: (data: any) => {
        res.jsonData = data;
        return res;
      },
      setHeader: (name: string, value: string) => {
        res.headers = res.headers || {};
        res.headers[name] = value;
      },
      getHeader: (name: string) => {
        return res.headers?.[name];
      }
    };

    const next = () => {
      // Rate limit passed
      resolve(null);
    };

    // Apply rate limiter
    rateLimiter(req, res, (err?: any) => {
      if (err || res.statusCode === 429) {
        // Rate limit exceeded
        resolve(
          NextResponse.json(
            res.jsonData || {
              error: 'Too many requests',
              code: 'RATE_LIMIT_EXCEEDED'
            },
            { 
              status: 429,
              headers: res.headers || {}
            }
          )
        );
      } else {
        // Rate limit passed
        resolve(null);
      }
    });
  });
}

/**
 * Helper function to apply rate limiting in API routes
 * Usage:
 * 
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await checkRateLimit(request);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // Continue with normal request handling
 * }
 */
export async function checkRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return applyRateLimit(request);
}
