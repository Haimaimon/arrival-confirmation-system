/**
 * Presentation Layer - Notification Controller
 * Handles HTTP requests for sending notifications
 */

import { Response } from 'express';
import { SendNotificationUseCase } from '../../application/use-cases/SendNotificationUseCase';
import { SendBulkNotificationsUseCase } from '../../application/use-cases/notification/SendBulkNotificationsUseCase';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotificationType } from '../../domain/entities/Notification';

export class NotificationController {
  constructor(
    private guestRepository: IGuestRepository,
    private notificationRepository: INotificationRepository,
    private sendNotificationUseCase: SendNotificationUseCase,
    private sendBulkNotificationsUseCase: SendBulkNotificationsUseCase
  ) {}

  /**
   * Send notification to a guest
   */
  sendNotification = async (req: AuthRequest, res: Response) => {
    try {
      const { guestId } = req.params;
      const { type, message } = req.body;

      console.log('📤 Sending notification:', { guestId, type, message });

      // Get guest to verify event ownership
      const guest = await this.guestRepository.findById(guestId);
      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found',
        });
      }

      const notification = await this.sendNotificationUseCase.execute({
        eventId: guest.eventId,
        guestId,
        type: type as NotificationType,
        message,
      });

      console.log('✅ Notification sent successfully:', notification.toObject());

      return res.json({
        success: true,
        data: notification.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Error sending notification:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Get notifications for a guest
   */
  getGuestNotifications = async (req: AuthRequest, res: Response) => {
    try {
      const { guestId } = req.params;

      const notifications = await this.notificationRepository.findByGuestId(guestId);

      return res.json({
        success: true,
        data: notifications.map(n => n.toObject()),
      });
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Get notifications for an event
   */
  getEventNotifications = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;

      const notifications = await this.notificationRepository.findByEventId(eventId);

      return res.json({
        success: true,
        data: notifications.map(n => n.toObject()),
        count: notifications.length,
      });
    } catch (error: any) {
      console.error('❌ Error fetching event notifications:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Bulk send notifications to multiple guests
   */
  sendBulkNotifications = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const { guestIds, type, message } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          error: 'Event ID is required',
        });
      }

      if (type === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Notification type is required',
        });
      }

      const result = await this.sendBulkNotificationsUseCase.execute({
        eventId,
        guestIds,
        type: type as NotificationType,
        message,
        initiatedBy: req.user?.userId,
      });

      return res.json({
        success: true,
        data: {
          batch: result.batch.toObject(),
          summary: {
            total: result.batch.totalRecipients,
            successful: result.successful,
            failed: result.failed,
            skipped: result.skipped,
          },
          errors: result.errors,
        },
      });
    } catch (error: any) {
      console.error('❌ Error sending bulk notifications:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

