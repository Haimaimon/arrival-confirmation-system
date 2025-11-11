/**
 * Presentation Layer - Table Routes
 */

import { Router } from 'express';
import { TableController } from '../controllers/TableController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generalLimiter } from '../middlewares/rateLimitMiddleware';

export function createTableRoutes(controller: TableController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // GET routes - no rate limiting (caching handles load)
  router.get('/event/:eventId/stats', controller.getTableStats);
  router.get('/event/:eventId', controller.getTables);

  // POST/PUT/DELETE routes - with rate limiting
  router.post('/', generalLimiter, controller.createTable);
  router.post('/assign', generalLimiter, controller.assignGuestToTable);
  router.put('/:id', generalLimiter, controller.updateTable);
  router.delete('/:id', generalLimiter, controller.deleteTable);

  return router;
}

