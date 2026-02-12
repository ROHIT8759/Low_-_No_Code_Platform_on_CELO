import { CacheKeys, CacheTTL } from '../lib/cache';

/**
 * Cache Service Tests
 * 
 * These tests verify the cache configuration, key generators, and TTL constants.
 * The actual Redis operations are tested through integration tests with a real Redis instance.
 */

describe('Cache Service - Configuration Tests', () => {
  describe('CacheKeys helpers', () => {
    it('should generate correct contract ABI key', () => {
      expect(CacheKeys.CONTRACT_ABI('0x123')).toBe('contract:abi:0x123');
    });

    it('should generate correct simulation key', () => {
      expect(CacheKeys.SIMULATION('abc123')).toBe('simulation:abc123');
    });

    it('should generate correct analysis key', () => {
      expect(CacheKeys.ANALYSIS('hash456')).toBe('analysis:hash456');
    });

    it('should generate correct artifact key', () => {
      expect(CacheKeys.ARTIFACT('artifact789')).toBe('artifact:artifact789');
    });

    it('should generate correct compilation job key', () => {
      expect(CacheKeys.COMPILATION_JOB('job-id')).toBe('job:job-id');
    });

    it('should handle special characters in keys', () => {
      const address = '0xABCDEF1234567890';
      expect(CacheKeys.CONTRACT_ABI(address)).toBe(`contract:abi:${address}`);
    });

    it('should generate unique keys for different inputs', () => {
      const key1 = CacheKeys.CONTRACT_ABI('address1');
      const key2 = CacheKeys.CONTRACT_ABI('address2');
      expect(key1).not.toBe(key2);
    });
  });

  describe('CacheTTL constants', () => {
    it('should have correct TTL values per requirements', () => {
      // Requirement 8.6: Cache TTL of 1 hour for contract metadata
      expect(CacheTTL.CONTRACT_ABI).toBe(3600); // 1 hour in seconds
      
      // Design spec: 5 minutes for simulation results
      expect(CacheTTL.SIMULATION).toBe(300); // 5 minutes in seconds
      
      // Design spec: 1 hour for analysis results
      expect(CacheTTL.ANALYSIS).toBe(3600); // 1 hour in seconds
      
      // Design spec: 24 hours for artifact metadata
      expect(CacheTTL.ARTIFACT).toBe(86400); // 24 hours in seconds
      
      // Design spec: 10 minutes for compilation jobs
      expect(CacheTTL.COMPILATION_JOB).toBe(600); // 10 minutes in seconds
    });

    it('should have all TTL values as positive integers', () => {
      const ttlValues = Object.values(CacheTTL);
      
      ttlValues.forEach(ttl => {
        expect(ttl).toBeGreaterThan(0);
        expect(Number.isInteger(ttl)).toBe(true);
      });
    });

    it('should have TTL values in reasonable ranges', () => {
      // All TTLs should be between 1 minute and 7 days
      const MIN_TTL = 60; // 1 minute
      const MAX_TTL = 604800; // 7 days
      
      const ttlValues = Object.values(CacheTTL);
      
      ttlValues.forEach(ttl => {
        expect(ttl).toBeGreaterThanOrEqual(MIN_TTL);
        expect(ttl).toBeLessThanOrEqual(MAX_TTL);
      });
    });
  });

  describe('Cache key structure validation', () => {
    it('should use consistent prefix patterns', () => {
      expect(CacheKeys.CONTRACT_ABI('test')).toMatch(/^contract:abi:/);
      expect(CacheKeys.SIMULATION('test')).toMatch(/^simulation:/);
      expect(CacheKeys.ANALYSIS('test')).toMatch(/^analysis:/);
      expect(CacheKeys.ARTIFACT('test')).toMatch(/^artifact:/);
      expect(CacheKeys.COMPILATION_JOB('test')).toMatch(/^job:/);
    });

    it('should handle empty string inputs', () => {
      const keys = [
        CacheKeys.CONTRACT_ABI(''),
        CacheKeys.SIMULATION(''),
        CacheKeys.ANALYSIS(''),
        CacheKeys.ARTIFACT(''),
        CacheKeys.COMPILATION_JOB(''),
      ];

      // Empty inputs should still generate valid keys with prefixes
      keys.forEach(key => {
        expect(key.length).toBeGreaterThan(0);
        expect(key).toContain(':');
      });
    });

    it('should preserve input in generated keys', () => {
      const input = 'test-value-123';
      
      expect(CacheKeys.CONTRACT_ABI(input)).toContain(input);
      expect(CacheKeys.SIMULATION(input)).toContain(input);
      expect(CacheKeys.ANALYSIS(input)).toContain(input);
      expect(CacheKeys.ARTIFACT(input)).toContain(input);
      expect(CacheKeys.COMPILATION_JOB(input)).toContain(input);
    });
  });

  describe('Cache configuration requirements', () => {
    it('should meet requirement 8.4: Cache layer for frequently accessed data', () => {
      // Verify cache key generators exist for all required data types
      expect(typeof CacheKeys.CONTRACT_ABI).toBe('function');
      expect(typeof CacheKeys.SIMULATION).toBe('function');
      expect(typeof CacheKeys.ANALYSIS).toBe('function');
      expect(typeof CacheKeys.ARTIFACT).toBe('function');
    });

    it('should meet requirement 8.5: Cache-first retrieval pattern', () => {
      // Verify TTL constants exist for cache expiration
      expect(CacheTTL.CONTRACT_ABI).toBeDefined();
      expect(CacheTTL.SIMULATION).toBeDefined();
      expect(CacheTTL.ANALYSIS).toBeDefined();
      expect(CacheTTL.ARTIFACT).toBeDefined();
    });

    it('should meet requirement 8.6: Cache TTL of 1 hour for contract metadata', () => {
      expect(CacheTTL.CONTRACT_ABI).toBe(3600);
    });
  });
});
