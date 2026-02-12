import { CacheService, CacheKeys, CacheTTL } from '../lib/cache';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis');

describe('Cache Service - Unit Tests', () => {
  let mockRedis: jest.Mocked<any>;
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock Redis instance with default return values
    mockRedis = {
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(0),
      exists: jest.fn().mockResolvedValue(0),
      keys: jest.fn().mockResolvedValue([]),
      ttl: jest.fn().mockResolvedValue(-2),
      incrby: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
      ping: jest.fn().mockResolvedValue('PONG'),
      on: jest.fn().mockReturnThis(),
      status: 'ready',
    };

    // Mock Redis constructor
    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);
    
    cacheService = new CacheService();
  });

  describe('get operation', () => {
    it('should retrieve and parse JSON value from cache', async () => {
      const testData = { foo: 'bar', count: 42 };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return string value when not valid JSON', async () => {
      mockRedis.get.mockResolvedValue('plain-string');

      const result = await cacheService.get('test-key');

      expect(result).toBe('plain-string');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set operation', () => {
    it('should set string value without TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set('test-key', 'test-value');

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should set object value by JSON stringifying', async () => {
      const testData = { foo: 'bar', count: 42 };
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set('test-key', testData);

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should set value with TTL when provided', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', 'test-value', 3600);

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 3600, 'test-value');
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should return true on successful set', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await cacheService.set('test-key', 'test-value');

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.set('test-key', 'test-value');

      expect(result).toBe(false);
    });
  });

  describe('del operation', () => {
    it('should delete key and return count', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cacheService.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(1);
    });

    it('should return 0 when key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await cacheService.del('nonexistent-key');

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.del('test-key');

      expect(result).toBe(0);
    });
  });

  describe('exists operation', () => {
    it('should return true when key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists('test-key');

      expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists('nonexistent-key');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.exists('test-key');

      expect(result).toBe(false);
    });
  });

  describe('TTL support', () => {
    it('should retrieve TTL for key', async () => {
      mockRedis.ttl.mockResolvedValue(3600);

      const result = await cacheService.ttl('test-key');

      expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
      expect(result).toBe(3600);
    });

    it('should return -1 for key with no expiry', async () => {
      mockRedis.ttl.mockResolvedValue(-1);

      const result = await cacheService.ttl('persistent-key');

      expect(result).toBe(-1);
    });

    it('should return -2 for nonexistent key', async () => {
      mockRedis.ttl.mockResolvedValue(-2);

      const result = await cacheService.ttl('nonexistent-key');

      expect(result).toBe(-2);
    });
  });

  describe('connection handling', () => {
    it('should connect lazily when not ready', async () => {
      mockRedis.status = 'wait';
      mockRedis.connect.mockResolvedValue(undefined);

      await cacheService.connect();

      expect(mockRedis.connect).toHaveBeenCalled();
    });

    it('should not reconnect when already ready', async () => {
      mockRedis.status = 'ready';

      await cacheService.connect();

      expect(mockRedis.connect).not.toHaveBeenCalled();
    });

    it('should ping successfully', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await cacheService.ping();

      expect(result).toBe(true);
    });

    it('should return false on ping failure', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.ping();

      expect(result).toBe(false);
    });
  });

  describe('error handling and retry logic', () => {
    it('should handle connection errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle timeout errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('ETIMEDOUT'));

      const result = await cacheService.set('test-key', 'value');

      expect(result).toBe(false);
    });
  });

  describe('additional operations', () => {
    it('should delete keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      const result = await cacheService.deletePattern('test:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
      expect(result).toBe(3);
    });

    it('should return 0 when no keys match pattern', async () => {
      mockRedis.keys.mockResolvedValue([]);

      const result = await cacheService.deletePattern('nonexistent:*');

      expect(result).toBe(0);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should increment numeric value', async () => {
      mockRedis.incrby.mockResolvedValue(5);

      const result = await cacheService.increment('counter', 5);

      expect(mockRedis.incrby).toHaveBeenCalledWith('counter', 5);
      expect(result).toBe(5);
    });

    it('should increment by 1 when amount not specified', async () => {
      mockRedis.incrby.mockResolvedValue(1);

      const result = await cacheService.increment('counter');

      expect(mockRedis.incrby).toHaveBeenCalledWith('counter', 1);
      expect(result).toBe(1);
    });
  });

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
  });

  describe('CacheTTL constants', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.CONTRACT_ABI).toBe(3600); // 1 hour
      expect(CacheTTL.SIMULATION).toBe(300); // 5 minutes
      expect(CacheTTL.ANALYSIS).toBe(3600); // 1 hour
      expect(CacheTTL.ARTIFACT).toBe(86400); // 24 hours
      expect(CacheTTL.COMPILATION_JOB).toBe(600); // 10 minutes
    });
  });
});
