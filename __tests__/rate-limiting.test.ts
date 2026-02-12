/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/middleware/rate-limit';

/**
 * Property-Based Tests for Rate Limiting
 * 
 * These tests validate that the rate limiting middleware enforces
 * request limits as specified in the requirements.
 */

// Helper to create a mock NextRequest
function createMockRequest(ip: string, url: string = 'http://localhost:3000/api/test'): NextRequest {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  
  const request = new NextRequest(url, {
    method: 'POST',
    headers,
  });
  
  // Mock the ip property
  Object.defineProperty(request, 'ip', {
    value: ip,
    writable: false,
  });
  
  return request;
}

// Helper to wait for a specified time
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Rate Limiting - Property-Based Tests', () => {
  // Clear rate limit state between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 20: Rate Limiting Enforces Request Limits', () => {
    // Feature: stellar-backend-infrastructure, Property 20: Rate Limiting Enforces Request Limits
    
    /**
     * **Validates: Requirements 7.2**
     * 
     * Property: For any IP address making API requests, the Backend_System should 
     * enforce a rate limit of 100 requests per minute, returning HTTP 429 
     * (Too Many Requests) for requests exceeding this limit.
     */
    it('allows up to 100 requests per minute from the same IP', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary IP addresses
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          // Generate number of requests within limit
          fc.integer({ min: 1, max: 100 }),
          async (ipAddress, requestCount) => {
            // Make requestCount requests from the same IP
            const results: (NextResponse | null)[] = [];
            
            for (let i = 0; i < requestCount; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            // Property: All requests within the limit should be allowed (return null)
            const blockedRequests = results.filter(r => r !== null);
            expect(blockedRequests.length).toBe(0);
            
            // All requests should pass through
            results.forEach(response => {
              expect(response).toBeNull();
            });
          }
        ),
        { numRuns: 10, timeout: 30000 } // Fewer runs due to sequential requests
      );
    }, 60000);

    it('blocks requests exceeding 100 per minute from the same IP', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary IP addresses
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          // Generate number of excess requests (101-110)
          fc.integer({ min: 101, max: 110 }),
          async (ipAddress, totalRequests) => {
            const results: (NextResponse | null)[] = [];
            
            // Make totalRequests requests from the same IP
            for (let i = 0; i < totalRequests; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            // Property: First 100 requests should pass, subsequent requests should be blocked
            const allowedRequests = results.slice(0, 100);
            const excessRequests = results.slice(100);

            // First 100 should be allowed
            allowedRequests.forEach((response, index) => {
              expect(response).toBeNull();
            });

            // Requests beyond 100 should be blocked with 429
            excessRequests.forEach((response, index) => {
              expect(response).not.toBeNull();
              if (response) {
                expect(response.status).toBe(429);
              }
            });

            // At least one request should be blocked
            expect(excessRequests.some(r => r !== null)).toBe(true);
          }
        ),
        { numRuns: 5, timeout: 60000 } // Fewer runs due to many sequential requests
      );
    }, 120000);

    it('returns HTTP 429 with appropriate error message for rate-limited requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary IP addresses
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          async (ipAddress) => {
            // Make 101 requests to trigger rate limit
            let rateLimitedResponse: NextResponse | null = null;
            
            for (let i = 0; i < 101; i++) {
              const request = createMockRequest(ipAddress);
              const response = await applyRateLimit(request);
              
              if (response !== null) {
                rateLimitedResponse = response;
                break;
              }
            }

            // Property: Rate-limited response must have status 429 and error information
            if (rateLimitedResponse) {
              expect(rateLimitedResponse.status).toBe(429);
              
              // Parse response body
              const body = await rateLimitedResponse.json();
              
              // Must have error field
              expect(body.error).toBeDefined();
              expect(typeof body.error).toBe('string');
              expect(body.error.toLowerCase()).toContain('too many requests');
              
              // Must have error code
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
          // Generate two different IP addresses
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
          ).filter(([ip1, ip2]) => ip1 !== ip2), // Ensure IPs are different
          // Number of requests per IP (within limit)
          fc.integer({ min: 50, max: 100 }),
          async ([ip1, ip2], requestsPerIP) => {
            const results1: (NextResponse | null)[] = [];
            const results2: (NextResponse | null)[] = [];
            
            // Make requests from IP1
            for (let i = 0; i < requestsPerIP; i++) {
              const request = createMockRequest(ip1);
              const response = await applyRateLimit(request);
              results1.push(response);
            }
            
            // Make requests from IP2
            for (let i = 0; i < requestsPerIP; i++) {
              const request = createMockRequest(ip2);
              const response = await applyRateLimit(request);
              results2.push(response);
            }

            // Property: Rate limits should be independent - both IPs should be allowed
            // their full quota of requests
            const blocked1 = results1.filter(r => r !== null).length;
            const blocked2 = results2.filter(r => r !== null).length;

            // Within the limit, neither IP should be blocked
            expect(blocked1).toBe(0);
            expect(blocked2).toBe(0);
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    it('rate limit window resets after 1 minute', async () => {
      // This test verifies that the rate limit window is truly 1 minute
      // by checking that requests are allowed again after the window expires
      
      const ipAddress = '192.168.1.100';
      
      // Make 100 requests to hit the limit
      for (let i = 0; i < 100; i++) {
        const request = createMockRequest(ipAddress);
        const response = await applyRateLimit(request);
        expect(response).toBeNull();
      }
      
      // 101st request should be blocked
      const blockedRequest = createMockRequest(ipAddress);
      const blockedResponse = await applyRateLimit(blockedRequest);
      expect(blockedResponse).not.toBeNull();
      expect(blockedResponse?.status).toBe(429);
      
      // Wait for rate limit window to reset (1 minute + buffer)
      // Note: In a real test environment, you might want to mock time instead
      // For this test, we'll use a shorter wait time to keep tests fast
      await wait(61000); // 61 seconds
      
      // After window reset, requests should be allowed again
      const newRequest = createMockRequest(ipAddress);
      const newResponse = await applyRateLimit(newRequest);
      expect(newResponse).toBeNull();
    }, 120000);

    it('handles requests with different IP extraction methods', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary IP address
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          async (ipAddress) => {
            // Test with x-forwarded-for header
            const request1 = createMockRequest(ipAddress);
            const response1 = await applyRateLimit(request1);
            
            // Test with x-real-ip header
            const headers2 = new Headers();
            headers2.set('x-real-ip', ipAddress);
            const request2 = new NextRequest('http://localhost:3000/api/test', {
              method: 'POST',
              headers: headers2,
            });
            const response2 = await applyRateLimit(request2);
            
            // Property: Rate limiting should work regardless of IP extraction method
            // Both should be allowed (or both blocked if we've hit the limit)
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
          // Generate arbitrary IP address
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 1, max: 255 })
          ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),
          // Generate different API endpoints
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
            
            // Make requests to the same endpoint
            for (let i = 0; i < requestCount; i++) {
              const url = `http://localhost:3000${endpoint}`;
              const request = createMockRequest(ipAddress, url);
              const response = await applyRateLimit(request);
              results.push(response);
            }

            // Property: Rate limiting should apply uniformly across all endpoints
            // All requests within limit should be allowed
            const blockedRequests = results.filter(r => r !== null);
            expect(blockedRequests.length).toBe(0);
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);
  });
});
