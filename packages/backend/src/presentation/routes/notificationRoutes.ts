/**
 * Presentation Layer - Notification Routes
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generalLimiter } from '../middlewares/rateLimitMiddleware';

export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);
  router.use(generalLimiter);

  // Send notification to a guest
  router.post('/guest/:guestId', controller.sendNotification);

  // Get notifications for a guest
  router.get('/guest/:guestId', controller.getGuestNotifications);

  // Get notifications for an event
  router.get('/event/:eventId', controller.getEventNotifications);

  // Bulk send notifications
  router.post('/event/:eventId/bulk', controller.sendBulkNotifications);

  return router;
}

