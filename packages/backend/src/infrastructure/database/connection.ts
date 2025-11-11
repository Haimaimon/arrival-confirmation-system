/**
 * Infrastructure Layer - Database Connection with Performance Logging
 */

import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { URL } from 'url';
import { logger } from '../services/LoggerService';

export class DatabaseConnection {
  private pool: Pool;
  private originalQuery: any;

  constructor(config: PoolConfig) {
    const isProd = process.env.NODE_ENV === 'production';
    let poolConfig = { ...config };

    if (process.env.DATABASE_URL) {
      poolConfig = this.getConfigFromDatabaseUrl(process.env.DATABASE_URL, config);
    }

    if (isProd) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    } else if (process.env.DB_SSL === 'true') {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    this.pool = new Pool(poolConfig);

    // Intercept query method to add logging
    this.originalQuery = this.pool.query.bind(this.pool);
    this.pool.query = this.wrappedQuery.bind(this) as any;

    this.pool.on('error', (err: Error) => {
      console.error('❌ Unexpected database error:', err);
      logger.error('Database pool error', err);
    });

    this.pool.on('connect', () => {
      logger.debug('📊 New database connection established');
    });

    this.pool.on('remove', () => {
      logger.debug('📊 Database connection removed from pool');
    });
  }

  private getConfigFromDatabaseUrl(databaseUrl: string, defaults: PoolConfig): PoolConfig {
    try {
      const url = new URL(databaseUrl);
      const [user, password] = url.username ? [url.username, url.password] : [defaults.user, defaults.password];
      const port = url.port ? parseInt(url.port, 10) : defaults.port;

      return {
        ...defaults,
        host: url.hostname || defaults.host,
        port: port || defaults.port,
        database: url.pathname ? url.pathname.replace(/^\//, '') : defaults.database,
        user,
        password,
      };
    } catch (error) {
      logger.error('❌ Failed to parse DATABASE_URL', error as Error);
      return defaults;
    }
  }

  /**
   * Wrapped query method with performance logging
   */
  private async wrappedQuery<T extends QueryResultRow = any>(
    queryTextOrConfig: any,
    values?: any[]
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const queryText = typeof queryTextOrConfig === 'string' 
      ? queryTextOrConfig 
      : queryTextOrConfig.text;

    try {
      const result = await this.originalQuery(queryTextOrConfig, values);
      const duration = Date.now() - startTime;

      // Log the query performance
      logger.logDatabaseQuery(
        queryText,
        duration,
        result.rowCount || 0,
        false // Not cached (direct DB query)
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ Database query failed after ${duration}ms`, error as Error, {
        query: queryText,
        duration,
      });
      throw error;
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export function createDatabaseConnection(): DatabaseConnection {
  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'arrival_confirmation',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  return new DatabaseConnection(config);
}

