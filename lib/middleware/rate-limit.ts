import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
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

export async function applyRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return new Promise((resolve) => {
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    
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
      
      resolve(null);
    };

    
    rateLimiter(req, res, (err?: any) => {
      if (err || res.statusCode === 429) {
        
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
        
        resolve(null);
      }
    });
  });
}

export async function checkRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  return applyRateLimit(request);
}
