import Redis, { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    
    const delay = Math.min(times * 50, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    
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

export class CacheService {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  
  async connect(): Promise<void> {
    if (this.client.status === 'ready') {
      return;
    }
    await this.client.connect();
  }

  
  async get<T = string>(key: string): Promise<T | null> {
    try {
      await this.connect();
      const value = await this.client.get(key);
      
      if (!value) {
        return null;
      }

      
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

  
  async del(key: string): Promise<number> {
    try {
      await this.connect();
      return await this.client.del(key);
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
      return 0;
    }
  }

  
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

  
  async ttl(key: string): Promise<number> {
    try {
      await this.connect();
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`[Cache] Error getting TTL for key ${key}:`, error);
      return -2;
    }
  }

  
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      await this.connect();
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error(`[Cache] Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  
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

export const cache = new CacheService();

export const CacheKeys = {
  CONTRACT_ABI: (address: string) => `contract:abi:${address}`,
  SIMULATION: (hash: string) => `simulation:${hash}`,
  ANALYSIS: (codeHash: string) => `analysis:${codeHash}`,
  ARTIFACT: (artifactId: string) => `artifact:${artifactId}`,
  COMPILATION_JOB: (jobId: string) => `job:${jobId}`,
} as const;

export const CacheTTL = {
  CONTRACT_ABI: 3600, 
  SIMULATION: 300, 
  ANALYSIS: 3600, 
  ARTIFACT: 86400, 
  COMPILATION_JOB: 600, 
} as const;
