/**
 * Infrastructure Layer - Professional Logger Service
 * Production-ready logging with Winston
 * Tracks performance, database queries, cache operations, and more
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface PerformanceLog {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DatabaseLog {
  query: string;
  duration: number;
  rowCount?: number;
  cached?: boolean;
  timestamp: Date;
}

export interface CacheLog {
  operation: 'GET' | 'SET' | 'DELETE' | 'CLEAR';
  key: string;
  hit: boolean;
  duration: number;
  timestamp: Date;
}

export class LoggerService {
  private logger: winston.Logger;
  private performanceMetrics: PerformanceLog[] = [];
  private databaseMetrics: DatabaseLog[] = [];
  private cacheMetrics: CacheLog[] = [];
  private readonly MAX_METRICS_IN_MEMORY = 1000;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');

    // Winston logger configuration
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'arrival-confirmation' },
      transports: [
        // Console output (development)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...metadata }) => {
              let msg = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              return msg;
            })
          ),
        }),

        // Error logs - separate file
        new DailyRotateFile({
          filename: path.join(logsDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
        }),

        // Combined logs - all levels
        new DailyRotateFile({
          filename: path.join(logsDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          maxSize: '20m',
        }),

        // Performance logs
        new DailyRotateFile({
          filename: path.join(logsDir, 'performance-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxFiles: '7d',
          maxSize: '20m',
        }),
      ],
    });

    console.log('📊 Logger Service initialized with file rotation');
  }

  // ==================== General Logging ====================

  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...metadata,
    });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug(message, metadata);
  }

  // ==================== Performance Logging ====================

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const log: PerformanceLog = {
      operation,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.performanceMetrics.push(log);
    this.trimMetrics(this.performanceMetrics);

    // Log with color coding based on duration
    let emoji = '⚡';
    let level = 'info';

    if (duration > 1000) {
      emoji = '🐌'; // Very slow > 1s
      level = 'warn';
    } else if (duration > 500) {
      emoji = '⚠️'; // Slow > 500ms
      level = 'warn';
    } else if (duration > 200) {
      emoji = '🕐'; // Medium > 200ms
    }

    this.logger.log(level, `${emoji} Performance: ${operation} completed in ${duration.toFixed(2)}ms`, {
      operation,
      duration,
      ...metadata,
    });
  }

  startTimer(operation: string): () => void {
    const start = Date.now();
    return (metadata?: Record<string, any>) => {
      const duration = Date.now() - start;
      this.logPerformance(operation, duration, metadata);
    };
  }

  // ==================== Database Logging ====================

  logDatabaseQuery(query: string, duration: number, rowCount?: number, cached?: boolean): void {
    const log: DatabaseLog = {
      query: this.sanitizeQuery(query),
      duration,
      rowCount,
      cached,
      timestamp: new Date(),
    };

    this.databaseMetrics.push(log);
    this.trimMetrics(this.databaseMetrics);

    let emoji = cached ? '💾' : '🗄️';
    if (duration > 500) emoji = '🐌';
    else if (duration > 100) emoji = '⚠️';

    this.logger.info(`${emoji} DB Query: ${duration.toFixed(2)}ms | Rows: ${rowCount || 0} | Cached: ${cached ? 'YES' : 'NO'}`, {
      query: this.sanitizeQuery(query),
      duration,
      rowCount,
      cached,
    });
  }

  startDatabaseTimer(query: string): (rowCount?: number, cached?: boolean) => void {
    const start = Date.now();
    return (rowCount?: number, cached?: boolean) => {
      const duration = Date.now() - start;
      this.logDatabaseQuery(query, duration, rowCount, cached);
    };
  }

  // ==================== Cache Logging ====================

  logCacheOperation(operation: 'GET' | 'SET' | 'DELETE' | 'CLEAR', key: string, hit: boolean, duration: number): void {
    const log: CacheLog = {
      operation,
      key,
      hit,
      duration,
      timestamp: new Date(),
    };

    this.cacheMetrics.push(log);
    this.trimMetrics(this.cacheMetrics);

    const emoji = hit ? '✅' : '❌';
    const hitStatus = hit ? 'HIT' : 'MISS';

    this.logger.info(`${emoji} Cache ${operation}: ${hitStatus} | ${key} | ${duration.toFixed(2)}ms`, {
      operation,
      key,
      hit,
      duration,
    });
  }

  startCacheTimer(operation: 'GET' | 'SET' | 'DELETE' | 'CLEAR', key: string): (hit: boolean) => void {
    const start = Date.now();
    return (hit: boolean) => {
      const duration = Date.now() - start;
      this.logCacheOperation(operation, key, hit, duration);
    };
  }

  // ==================== API Request Logging ====================

  logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): void {
    let emoji = '📥';
    let level = 'info';

    if (statusCode >= 500) {
      emoji = '❌';
      level = 'error';
    } else if (statusCode >= 400) {
      emoji = '⚠️';
      level = 'warn';
    } else if (statusCode >= 300) {
      emoji = '🔀';
    } else if (statusCode >= 200) {
      emoji = '✅';
    }

    this.logger.log(level, `${emoji} ${method} ${path} | ${statusCode} | ${duration.toFixed(2)}ms`, {
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  // ==================== Metrics & Statistics ====================

  getPerformanceStats() {
    return this.calculateStats(this.performanceMetrics.map(m => m.duration));
  }

  getDatabaseStats() {
    const durations = this.databaseMetrics.map(m => m.duration);
    const cacheHitRate = this.databaseMetrics.filter(m => m.cached).length / this.databaseMetrics.length || 0;
    const totalRows = this.databaseMetrics.reduce((sum, m) => sum + (m.rowCount || 0), 0);

    return {
      ...this.calculateStats(durations),
      totalQueries: this.databaseMetrics.length,
      cacheHitRate: (cacheHitRate * 100).toFixed(2) + '%',
      totalRows,
      avgRowsPerQuery: (totalRows / this.databaseMetrics.length || 0).toFixed(2),
    };
  }

  getCacheStats() {
    const durations = this.cacheMetrics.map(m => m.duration);
    const hits = this.cacheMetrics.filter(m => m.hit).length;
    const hitRate = hits / this.cacheMetrics.length || 0;

    const operationCounts = this.cacheMetrics.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...this.calculateStats(durations),
      totalOperations: this.cacheMetrics.length,
      hits,
      misses: this.cacheMetrics.length - hits,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      operationCounts,
    };
  }

  getAllMetrics() {
    return {
      performance: this.getPerformanceStats(),
      database: this.getDatabaseStats(),
      cache: this.getCacheStats(),
      timestamp: new Date(),
    };
  }

  // ==================== Helper Methods ====================

  private calculateStats(durations: number[]) {
    if (durations.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: durations.length,
      min: sorted[0].toFixed(2) + 'ms',
      max: sorted[sorted.length - 1].toFixed(2) + 'ms',
      avg: (sum / durations.length).toFixed(2) + 'ms',
      median: sorted[Math.floor(sorted.length / 2)].toFixed(2) + 'ms',
      p95: sorted[Math.floor(sorted.length * 0.95)].toFixed(2) + 'ms',
      p99: sorted[Math.floor(sorted.length * 0.99)].toFixed(2) + 'ms',
    };
  }

  private sanitizeQuery(query: string): string {
    // Truncate long queries
    return query.length > 100 ? query.substring(0, 100) + '...' : query;
  }

  private trimMetrics<T>(metrics: T[]): void {
    if (metrics.length > this.MAX_METRICS_IN_MEMORY) {
      metrics.splice(0, metrics.length - this.MAX_METRICS_IN_MEMORY);
    }
  }

  // ==================== Production Readiness Checks ====================

  logProductionReadinessCheck(checks: Record<string, boolean>): void {
    const allPassed = Object.values(checks).every(v => v);
    const emoji = allPassed ? '✅' : '❌';

    this.logger.info(`${emoji} Production Readiness Check`, {
      allPassed,
      checks,
    });

    if (!allPassed) {
      this.logger.warn('⚠️ Some production readiness checks failed!', { checks });
    }
  }
}

// Singleton instance
export const logger = new LoggerService();

