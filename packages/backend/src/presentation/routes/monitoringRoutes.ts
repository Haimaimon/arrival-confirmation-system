/**
 * Presentation Layer - Monitoring Routes
 * System health, metrics, and performance monitoring
 */

import { Router } from 'express';
import { MonitoringController } from '../controllers/MonitoringController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createMonitoringRoutes(controller: MonitoringController): Router {
  const router = Router();

  // Public health check (no auth) - for load balancers and monitoring tools
  router.get('/health', controller.healthCheck);

  // Protected routes - require authentication
  router.use(authMiddleware);
  
  router.get('/metrics', controller.getMetrics);
  router.get('/production-ready', controller.productionReadinessCheck);

  return router;
}

