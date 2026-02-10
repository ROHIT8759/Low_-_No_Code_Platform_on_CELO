import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis Cache Configuration and Operations
 * 
 * Provides a centralized caching layer for:
 * - Contract ABIs and metadata
 * - Simulation results
 * - AI analysis results
 * - Artifact metadata
 */

// Redis connection configuration
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, max 3000ms
    const delay = Math.min(times * 50, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

// Singleton Redis client instance
let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    // Connection event handlers
    redisClient.on('connect', () => {
      console.log('[Cache] Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('[Cache] Redis client ready');
    });

    redisClient.on('error', (err) => {
      console.error('[Cache] Redis client error:', err);
    });

    redisClient.on('close', () => {
      console.log('[Cache] Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Cache] Redis client reconnecting');
    });
  }

  return redisClient;
}

/**
 * Cache operations interface
 */
export class CacheService {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  /**
   * Connect to Redis (lazy connection)
   */
  async connect(): Promise<void> {
    if (this.client.status === 'ready') {
      return;
    }
    await this.client.connect();
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T = string>(key: string): Promise<T | null> {
    try {
      await this.connect();
      const value = await this.client.get(key);
      
      if (!value) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified if object)
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      await this.connect();
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param key Cache key
   * @returns Number of keys deleted
   */
  async del(key: string): Promise<number> {
    try {
      await this.connect();
      return await this.client.del(key);
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`[Cache] Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param pattern Key pattern (e.g., "contract:*")
   * @returns Number of keys deleted
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      await this.connect();
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      await this.connect();
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`[Cache] Error getting TTL for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Increment a numeric value
   * @param key Cache key
   * @param amount Amount to increment by (default: 1)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      await this.connect();
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error(`[Cache] Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Ping Redis to check connection
   */
  async ping(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('[Cache] Ping failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

// Cache key prefixes for organization
export const CacheKeys = {
  CONTRACT_ABI: (address: string) => `contract:abi:${address}`,
  SIMULATION: (hash: string) => `simulation:${hash}`,
  ANALYSIS: (codeHash: string) => `analysis:${codeHash}`,
  ARTIFACT: (artifactId: string) => `artifact:${artifactId}`,
  COMPILATION_JOB: (jobId: string) => `job:${jobId}`,
} as const;

// Cache TTL constants (in seconds)
export const CacheTTL = {
  CONTRACT_ABI: 3600, // 1 hour
  SIMULATION: 300, // 5 minutes
  ANALYSIS: 3600, // 1 hour
  ARTIFACT: 86400, // 24 hours
  COMPILATION_JOB: 600, // 10 minutes
} as const;
