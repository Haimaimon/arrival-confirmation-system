/**
 * Presentation Layer - Monitoring Controller
 * Provides system health, metrics, and performance statistics
 */

import { Request, Response } from 'express';
import { logger } from '../../infrastructure/services/LoggerService';
import { DatabaseConnection } from '../../infrastructure/database/connection';
import { RedisCacheService } from '../../infrastructure/services/RedisCacheService';

export class MonitoringController {
  constructor(
    private dbConnection: DatabaseConnection,
    private cacheService: RedisCacheService
  ) {}

  /**
   * Health check endpoint
   * GET /api/v1/monitoring/health
   */
  healthCheck = async (_req: Request, res: Response) => {
    try {
      const startTime = Date.now();

      // Check database
      const dbHealthy = await this.checkDatabaseHealth();

      // Check cache
      const cacheHealthy = await this.checkCacheHealth();

      const duration = Date.now() - startTime;
      const isHealthy = dbHealthy && cacheHealthy;

      const health = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: dbHealthy ? 'OK' : 'FAILED',
          cache: cacheHealthy ? 'OK' : 'FAILED',
        },
        duration: `${duration}ms`,
      };

      logger.info('🏥 Health check performed', health);

      return res.status(isHealthy ? 200 : 503).json(health);
    } catch (error: any) {
      logger.error('❌ Health check failed', error);
      return res.status(503).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  };

  /**
   * Get performance metrics
   * GET /api/v1/monitoring/metrics
   */
  getMetrics = async (_req: Request, res: Response) => {
    try {
      const metrics = {
        ...logger.getAllMetrics(),
        database: {
          ...logger.getDatabaseStats(),
          poolStats: this.dbConnection.getPoolStats(),
        },
        cache: {
          ...logger.getCacheStats(),
          instanceStats: this.cacheService.getCacheStats(),
        },
        system: this.getSystemMetrics(),
      };

      logger.info('📊 Metrics retrieved');

      return res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      logger.error('❌ Failed to get metrics', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Production readiness check
   * GET /api/v1/monitoring/production-ready
   */
  productionReadinessCheck = async (_req: Request, res: Response) => {
    try {
      const checks = {
        databaseConnected: await this.checkDatabaseHealth(),
        cacheConnected: await this.checkCacheHealth(),
        environmentVariablesSet: this.checkEnvironmentVariables(),
        loggingConfigured: true,
        jwtSecretSet: !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key-change-in-production',
        productionMode: process.env.NODE_ENV === 'production',
        databasePoolHealthy: this.checkDatabasePool(),
        memoryUsageNormal: this.checkMemoryUsage(),
      };

      const allPassed = Object.values(checks).every(v => v);

      logger.logProductionReadinessCheck(checks);

      return res.json({
        success: true,
        ready: allPassed,
        checks,
        recommendations: this.getRecommendations(checks),
      });
    } catch (error: any) {
      logger.error('❌ Production readiness check failed', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  // ==================== Helper Methods ====================

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      return await this.dbConnection.testConnection();
    } catch {
      return false;
    }
  }

  private async checkCacheHealth(): Promise<boolean> {
    try {
      await this.cacheService.get('health-check');
      return true;
    } catch {
      return false;
    }
  }

  private checkEnvironmentVariables(): boolean {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_HOST', 'REDIS_PORT'];
    return required.every(key => !!process.env[key]);
  }

  private checkDatabasePool(): boolean {
    const stats = this.dbConnection.getPoolStats();
    // Pool should have connections and not be waiting
    return stats.total > 0 && stats.waiting < 5;
  }

  private checkMemoryUsage(): boolean {
    const memoryUsage = process.memoryUsage();
    const maxHeapSize = 1024 * 1024 * 1024; // 1GB
    return memoryUsage.heapUsed < maxHeapSize;
  }

  private getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    return {
      uptime: `${(process.uptime() / 60 / 60).toFixed(2)} hours`,
      memory: {
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    };
  }

  private getRecommendations(checks: Record<string, boolean>): string[] {
    const recommendations: string[] = [];

    if (!checks.databaseConnected) {
      recommendations.push('❌ Database is not connected. Check DATABASE_URL in .env');
    }

    if (!checks.cacheConnected) {
      recommendations.push('❌ Redis cache is not connected. Check REDIS_HOST and REDIS_PORT in .env');
    }

    if (!checks.jwtSecretSet) {
      recommendations.push('⚠️ JWT_SECRET is not set or using default value. Change it in production!');
    }

    if (!checks.productionMode) {
      recommendations.push('ℹ️ Not running in production mode. Set NODE_ENV=production');
    }

    if (!checks.databasePoolHealthy) {
      recommendations.push('⚠️ Database pool has issues. Too many waiting connections.');
    }

    if (!checks.memoryUsageNormal) {
      recommendations.push('⚠️ Memory usage is high. Consider increasing server resources.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All checks passed! System is production-ready.');
    }

    return recommendations;
  }
}

