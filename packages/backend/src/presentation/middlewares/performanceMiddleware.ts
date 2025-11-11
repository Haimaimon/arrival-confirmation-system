/**
 * Presentation Layer - Performance Monitoring Middleware
 * Tracks API request/response times and logs performance metrics
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/services/LoggerService';
import { AuthRequest } from './authMiddleware';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log after response
  res.end = function (
    this: Response,
    chunk?: any,
    encodingOrCallback?: BufferEncoding | (() => void),
    callback?: () => void
  ): Response {
    // Restore original end function
    res.end = originalEnd;

    // Calculate metrics
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    // Get user ID if authenticated
    const userId = (req as AuthRequest).user?.userId;

    // Log the API request
    logger.logApiRequest(
      req.method,
      req.path,
      res.statusCode,
      duration,
      userId
    );

    // Log performance if request took too long
    if (duration > 1000) {
      logger.warn(`⚠️ Slow request detected: ${req.method} ${req.path} took ${duration}ms`, {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode,
        memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      });
    }

    // Log performance metric
    logger.logPerformance(`API: ${req.method} ${req.path}`, duration, {
      statusCode: res.statusCode,
      memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      userId,
    });

    // Call the original end function
    const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : undefined;
    const cb = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;

    return originalEnd.call(this, chunk, encoding as any, cb);
  };

  next();
};

/**
 * Request size middleware - logs large requests
 */
export const requestSizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    const size = JSON.stringify(req.body).length;
    const sizeKB = size / 1024;

    if (sizeKB > 100) {
      logger.warn(`⚠️ Large request body: ${sizeKB.toFixed(2)}KB`, {
        method: req.method,
        path: req.path,
        sizeKB: sizeKB.toFixed(2),
      });
    }
  }
  next();
};

