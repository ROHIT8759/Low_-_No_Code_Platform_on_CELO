

import * as fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/middleware/rate-limit';

function createMockRequest(ip: string, url: string = 'http://localhost:3000/api/test'): NextRequest {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  
  const request = new NextRequest(url, {
    method: 'POST',
    headers,
  });
  
  
  Object.defineProperty(request, 'ip', {
    value: ip,
    writable: false,
  });
  
  return request;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Rate Limiting - Property-Based Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 20: Rate Limiting Enforces Request Limits', () => {
    
    
    
    it('allows up to 100 requests per minute from the same IP', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          
          fc.integer({ min: 1, max: 100 }),
          async (ipAddress, requestCount) => {
            
            const results: (NextResponse | null)[] = [];
            
            for (let i = 0; i < requestCount; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            
            const blockedRequests = results.filter(r => r !== null);
            expect(blockedRequests.length).toBe(0);
            
            
            results.forEach(response => {
              expect(response).toBeNull();
            });
          }
        ),
        { numRuns: 10, timeout: 30000 } 
      );
    }, 60000);

    it('blocks requests exceeding 100 per minute from the same IP', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          
          fc.integer({ min: 101, max: 110 }),
          async (ipAddress, totalRequests) => {
            const results: (NextResponse | null)[] = [];
            
            
            for (let i = 0; i < totalRequests; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            
            const allowedRequests = results.slice(0, 100);
            const excessRequests = results.slice(100);

            
            allowedRequests.forEach((response, index) => {
              expect(response).toBeNull();
            });

            
            excessRequests.forEach((response, index) => {
              expect(response).not.toBeNull();
              if (response) {
                expect(response.status).toBe(429);
              }
            });

            
            expect(excessRequests.some(r => r !== null)).toBe(true);
          }
        ),
        { numRuns: 5, timeout: 60000 } 
      );
    }, 120000);

    it('returns HTTP 429 with appropriate error message for rate-limited requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          async (ipAddress) => {
            
            let rateLimitedResponse: NextResponse | null = null;
            
            for (let i = 0; i < 101; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              
              if (response !== null) {
                rateLimitedResponse = response;
                break;
              }
            }

            
            if (rateLimitedResponse) {
              expect(rateLimitedResponse.status).toBe(429);
              
              
              const body = await rateLimitedResponse.json();
              
              
              expect(body.error).toBeDefined();
              expect(typeof body.error).toBe('string');
              expect(body.error.toLowerCase()).toContain('too many requests');
              
              
              expect(body.code).toBeDefined();
              expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    it('rate limits are independent per IP address', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.tuple(
              fc.integer({ min: 1, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 1, max: 255 })
            ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
            fc.tuple(
              fc.integer({ min: 1, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 1, max: 255 })
            ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`)
          ).filter(([ip1, ip2]) => ip1 !== ip2), 
          
          fc.integer({ min: 50, max: 100 }),
          async ([ip1, ip2], requestsPerIP) => {
            const results1: (NextResponse | null)[] = [];
            const results2: (NextResponse | null)[] = [];
            
            
            for (let i = 0; i < requestsPerIP; i++) {
              const request = createMockRequest(ip1);
              const response = await applyRateLimit(request);
              results1.push(response);
            }
            
            
            for (let i = 0; i < requestsPerIP; i++) {
              const request = createMockRequest(ip2);
              const response = await applyRateLimit(request);
              results2.push(response);
            }

            
            
            const blocked1 = results1.filter(r => r !== null).length;
            const blocked2 = results2.filter(r => r !== null).length;

            
            expect(blocked1).toBe(0);
            expect(blocked2).toBe(0);
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    it('rate limit window resets after 1 minute', async () => {
      
      
      
      const ipAddress = '192.168.1.100';
      
      
      for (let i = 0; i < 100; i++) {
        const request = createMockRequest(ipAddress);
        const response = await applyRateLimit(request);
        expect(response).toBeNull();
      }
      
      
      const blockedRequest = createMockRequest(ipAddress);
      const blockedResponse = await applyRateLimit(blockedRequest);
      expect(blockedResponse).not.toBeNull();
      expect(blockedResponse?.status).toBe(429);
      
      
      
      
      await wait(61000); 
      
      
      const newRequest = createMockRequest(ipAddress);
      const newResponse = await applyRateLimit(newRequest);
      expect(newResponse).toBeNull();
    }, 120000);

    it('handles requests with different IP extraction methods', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          async (ipAddress) => {
            
            const request1 = createMockRequest(ipAddress);
            const response1 = await applyRateLimit(request1);
            
            
            const headers2 = new Headers();
            headers2.set('x-real-ip', ipAddress);
            const request2 = new NextRequest('http://localhost:3000/api/test', {
              method: 'POST',
              headers: headers2,
            });
            const response2 = await applyRateLimit(request2);
            
            
            
            expect(response1).toBeNull();
            expect(response2).toBeNull();
          }
        ),
        { numRuns: 10, timeout: 30000 }
      );
    }, 60000);

    it('rate limit applies to all API endpoints uniformly', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          
          fc.constantFrom(
            '/api/compile/evm',
            '/api/compile/stellar',
            '/api/deploy/evm',
            '/api/deploy/stellar',
            '/api/simulate',
            '/api/analyze'
          ),
          fc.integer({ min: 50, max: 100 }),
          async (ipAddress, endpoint, requestCount) => {
            const results: (NextResponse | null)[] = [];
            
            
            for (let i = 0; i < requestCount; i++) {
              const url = `http://localhost:3000${endpoint}`;
              const request = createMockRequest(ipAddress, url);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            
            
            const blockedRequests = results.filter(r => r !== null);
            expect(blockedRequests.length).toBe(0);
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);
  });
});
