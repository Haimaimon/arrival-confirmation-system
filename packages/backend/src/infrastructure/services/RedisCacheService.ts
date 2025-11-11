/**
 * Infrastructure Layer - Redis Cache Service Implementation with Performance Logging
 */

import { createClient, RedisClientType } from 'redis';
import { ICacheService } from '../../domain/services/ICacheService';
import { logger } from './LoggerService';

export class RedisCacheService implements ICacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    useTLS?: boolean;
    rejectUnauthorized?: boolean;
  }) {
    const redisUrl = config.url || process.env.REDIS_URL;
    const redissScheme = redisUrl ? redisUrl.startsWith('rediss://') : false;
    const envTls = process.env.REDIS_TLS === 'true' || process.env.REDIS_SSL === 'true';
    const useTLS =
      typeof config.useTLS === 'boolean' ? config.useTLS : redissScheme || envTls;
    const rejectUnauthorizedEnv = process.env.REDIS_REJECT_UNAUTHORIZED;
    const rejectUnauthorized =
      config.rejectUnauthorized ??
      (rejectUnauthorizedEnv ? rejectUnauthorizedEnv === 'true' : false);

    const socketOptions: any = {};
    if (useTLS) {
      socketOptions.tls = true;
      socketOptions.rejectUnauthorized = rejectUnauthorized;
    }

    if (redisUrl) {
      const safeRedisUrl = redisUrl.replace(/:\/\/.*@/, '://***@');
      logger.info('🔌 Connecting to Redis via URL', { url: safeRedisUrl, useTLS, rejectUnauthorized });
      this.client = createClient({
        url: redisUrl,
        socket: socketOptions,
        password: config.password || process.env.REDIS_PASSWORD,
        database: config.db ?? parseInt(process.env.REDIS_DB || '0', 10),
      });
    } else {
      if (!config.host) {
        throw new Error('Redis host is required when REDIS_URL is not provided');
      }
      logger.info('🔌 Connecting to Redis via host/port', {
        host: config.host,
        port: config.port,
        useTLS,
      });
      this.client = createClient({
        socket: {
          host: config.host,
          port: config.port,
          ...socketOptions,
        },
        password: config.password,
        database: config.db || 0,
      });
    }

    this.client.on('error', (err: Error) => {
      console.error('❌ Redis Client Error', err);
      logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    this.client.on('reconnecting', () => {
      logger.warn('⚠️ Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    await this.ensureConnected();
    
    const value = await this.client.get(key);
    const duration = Date.now() - startTime;
    const hit = value !== null;

    // Update hit/miss counters
    if (hit) {
      this.hits++;
    } else {
      this.misses++;
    }

    // Log cache operation
    logger.logCacheOperation('GET', key, hit, duration);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const startTime = Date.now();
    await this.ensureConnected();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }

    const duration = Date.now() - startTime;
    logger.logCacheOperation('SET', key, true, duration);
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();
    await this.ensureConnected();
    await this.client.del(key);
    
    const duration = Date.now() - startTime;
    logger.logCacheOperation('DELETE', key, true, duration);
  }

  async deletePattern(pattern: string): Promise<void> {
    await this.ensureConnected();
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await this.client.exists(key);
    return result === 1;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2) + '%',
      isConnected: this.isConnected,
    };
  }
}

