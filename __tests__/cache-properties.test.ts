import * as fc from 'fast-check';
import { CacheService, CacheKeys, CacheTTL } from '../lib/cache';
import Redis from 'ioredis';

// Feature: stellar-backend-infrastructure

jest.mock('ioredis');

describe('Cache Service - Property-Based Tests', () => {
  let mockRedis: jest.Mocked<Redis>;
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRedis = {
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
      ttl: jest.fn(),
      incrby: jest.fn(),
      quit: jest.fn(),
      ping: jest.fn(),
      on: jest.fn(),
      status: 'ready',
    } as any;

    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);
    cacheService = new CacheService();
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 1: Cache Set-Get Roundtrip Preserves Data
   * 
   * For any valid key-value pair, setting a value in cache and immediately
   * retrieving it should return the same value (serialization roundtrip).
   */
  it('Property 1: set-get roundtrip preserves data for all valid inputs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.record({
            str: fc.string(),
            num: fc.integer(),
            bool: fc.boolean(),
          })
        ), // value
        async (key, value) => {
          // Setup mock to return serialized value
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          mockRedis.set.mockResolvedValue('OK' as any);
          mockRedis.get.mockResolvedValue(serialized);

          // Set value
          const setResult = await cacheService.set(key, value);
          expect(setResult).toBe(true);

          // Get value
          const retrieved = await cacheService.get(key);

          // Verify roundtrip
          expect(retrieved).toEqual(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.6**
   * 
   * Property 2: Cache TTL Enforcement
   * 
   * For any key-value pair with a TTL, the cache should store the value
   * with the specified expiration time using setex.
   */
  it('Property 2: TTL is correctly applied when specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.string(), // value
        fc.integer({ min: 1, max: 86400 }), // ttl in seconds (1 sec to 1 day)
        async (key, value, ttl) => {
          mockRedis.setex.mockResolvedValue('OK' as any);

          await cacheService.set(key, value, ttl);

          // Verify setex was called with correct TTL
          expect(mockRedis.setex).toHaveBeenCalledWith(key, ttl, value);
          expect(mockRedis.set).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 3: Delete Operation Idempotency
   * 
   * For any key, deleting it multiple times should be safe and return
   * appropriate counts (1 for first delete, 0 for subsequent deletes).
   */
  it('Property 3: delete operation is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        async (key) => {
          // First delete returns 1 (key existed)
          mockRedis.del.mockResolvedValueOnce(1);
          const firstDelete = await cacheService.del(key);
          expect(firstDelete).toBe(1);

          // Second delete returns 0 (key no longer exists)
          mockRedis.del.mockResolvedValueOnce(0);
          const secondDelete = await cacheService.del(key);
          expect(secondDelete).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 4: Exists Check Consistency
   * 
   * For any key, if exists() returns true, get() should not return null.
   * If exists() returns false, get() should return null.
   */
  it('Property 4: exists check is consistent with get operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.boolean(), // whether key exists
        async (key, keyExists) => {
          mockRedis.exists.mockResolvedValue(keyExists ? 1 : 0);
          mockRedis.get.mockResolvedValue(keyExists ? 'some-value' : null);

          const exists = await cacheService.exists(key);
          const value = await cacheService.get(key);

          if (exists) {
            expect(value).not.toBeNull();
          } else {
            expect(value).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 5: Error Resilience
   * 
   * For any operation, if Redis throws an error, the cache service should
   * handle it gracefully and return appropriate default values without crashing.
   */
  it('Property 5: all operations handle errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.string(), // value
        async (key, value) => {
          const error = new Error('Redis connection failed');
          
          // Test get with error
          mockRedis.get.mockRejectedValue(error);
          const getResult = await cacheService.get(key);
          expect(getResult).toBeNull();

          // Test set with error
          mockRedis.set.mockRejectedValue(error);
          const setResult = await cacheService.set(key, value);
          expect(setResult).toBe(false);

          // Test del with error
          mockRedis.del.mockRejectedValue(error);
          const delResult = await cacheService.del(key);
          expect(delResult).toBe(0);

          // Test exists with error
          mockRedis.exists.mockRejectedValue(error);
          const existsResult = await cacheService.exists(key);
          expect(existsResult).toBe(false);

          // Test ttl with error
          mockRedis.ttl.mockRejectedValue(error);
          const ttlResult = await cacheService.ttl(key);
          expect(ttlResult).toBe(-2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 6: JSON Serialization Preserves Structure
   * 
   * For any complex object, the cache should correctly serialize and
   * deserialize it, preserving the object structure.
   */
  it('Property 6: complex objects are correctly serialized and deserialized', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.record({
          id: fc.uuid(),
          name: fc.string(),
          count: fc.integer(),
          active: fc.boolean(),
          tags: fc.array(fc.string(), { maxLength: 5 }),
          metadata: fc.record({
            created: fc.date().map(d => d.toISOString()),
            score: fc.float({ min: 0, max: 100 }),
          }),
        }),
        async (key, complexObject) => {
          const serialized = JSON.stringify(complexObject);
          mockRedis.set.mockResolvedValue('OK' as any);
          mockRedis.get.mockResolvedValue(serialized);

          await cacheService.set(key, complexObject);
          const retrieved = await cacheService.get(key);

          expect(retrieved).toEqual(complexObject);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 7: Increment Operation Monotonicity
   * 
   * For any counter key, incrementing it should always increase the value
   * by the specified amount.
   */
  it('Property 7: increment operation increases value monotonically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // key
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }), // increments
        async (key, increments) => {
          let currentValue = 0;

          for (const increment of increments) {
            currentValue += increment;
            mockRedis.incrby.mockResolvedValue(currentValue);

            const result = await cacheService.increment(key, increment);
            expect(result).toBe(currentValue);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.5**
   * 
   * Property 8: Pattern Deletion Matches All Keys
   * 
   * For any pattern, deletePattern should delete all keys matching that
   * pattern and return the correct count.
   */
  it('Property 8: pattern deletion removes all matching keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }), // prefix
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }), // suffixes
        async (prefix, suffixes) => {
          const keys = suffixes.map(suffix => `${prefix}:${suffix}`);
          mockRedis.keys.mockResolvedValue(keys);
          mockRedis.del.mockResolvedValue(keys.length);

          const result = await cacheService.deletePattern(`${prefix}:*`);

          expect(result).toBe(keys.length);
          if (keys.length > 0) {
            expect(mockRedis.del).toHaveBeenCalledWith(...keys);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.6**
   * 
   * Property 9: Cache Key Generators Produce Valid Keys
   * 
   * For any input to cache key generators, they should produce valid,
   * non-empty keys with the correct prefix.
   */
  it('Property 9: cache key generators produce valid keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (input) => {
          const contractKey = CacheKeys.CONTRACT_ABI(input);
          expect(contractKey).toMatch(/^contract:abi:.+/);
          expect(contractKey.length).toBeGreaterThan('contract:abi:'.length);

          const simKey = CacheKeys.SIMULATION(input);
          expect(simKey).toMatch(/^simulation:.+/);
          expect(simKey.length).toBeGreaterThan('simulation:'.length);

          const analysisKey = CacheKeys.ANALYSIS(input);
          expect(analysisKey).toMatch(/^analysis:.+/);
          expect(analysisKey.length).toBeGreaterThan('analysis:'.length);

          const artifactKey = CacheKeys.ARTIFACT(input);
          expect(artifactKey).toMatch(/^artifact:.+/);
          expect(artifactKey.length).toBeGreaterThan('artifact:'.length);

          const jobKey = CacheKeys.COMPILATION_JOB(input);
          expect(jobKey).toMatch(/^job:.+/);
          expect(jobKey.length).toBeGreaterThan('job:'.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4, 8.6**
   * 
   * Property 10: TTL Values Are Positive
   * 
   * All predefined TTL constants should be positive integers representing
   * valid expiration times in seconds.
   */
  it('Property 10: all TTL constants are positive integers', () => {
    const ttlValues = Object.values(CacheTTL);
    
    ttlValues.forEach(ttl => {
      expect(ttl).toBeGreaterThan(0);
      expect(Number.isInteger(ttl)).toBe(true);
    });

    // Verify specific requirements
    expect(CacheTTL.CONTRACT_ABI).toBe(3600); // 1 hour per requirement 8.6
    expect(CacheTTL.SIMULATION).toBe(300); // 5 minutes
    expect(CacheTTL.ANALYSIS).toBe(3600); // 1 hour
  });
});
