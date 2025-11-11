/**
 * Presentation Layer - Rate Limiting Middleware
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter - relaxed for development
 * Can be tightened in production via environment variables
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute (was 15 minutes)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute (was 100 per 15 min)
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip failed requests - only count successful ones
  skipFailedRequests: true,
});

/**
 * Authentication rate limiter - stricter for security
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window (increased from 5)
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Notification rate limiter - prevent spam
 */
export const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 notifications per minute (increased from 10)
  message: 'Too many notification requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});
