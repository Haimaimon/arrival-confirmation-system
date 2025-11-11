/**
 * Presentation Layer - Notification Controller
 * Handles HTTP requests for sending notifications
 */

import { Response } from 'express';
import { SendNotificationUseCase } from '../../application/use-cases/SendNotificationUseCase';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { INotificationService } from '../../domain/services/INotificationService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotificationType } from '../../domain/entities/Notification';

export class NotificationController {
  constructor(
    private guestRepository: IGuestRepository,
    private notificationRepository: INotificationRepository,
    private notificationService: INotificationService
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

      const useCase = new SendNotificationUseCase(
        this.guestRepository,
        this.notificationRepository,
        this.notificationService
      );

      const notification = await useCase.execute({
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
      const { guestIds, type, message } = req.body;

      if (!Array.isArray(guestIds) || guestIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'guestIds must be a non-empty array',
        });
      }

      const useCase = new SendNotificationUseCase(
        this.guestRepository,
        this.notificationRepository,
        this.notificationService
      );

      const results = [];
      const errors = [];

      for (const guestId of guestIds) {
        try {
          const guest = await this.guestRepository.findById(guestId);
          if (!guest) {
            errors.push({ guestId, error: 'Guest not found' });
            continue;
          }

          const notification = await useCase.execute({
            eventId: guest.eventId,
            guestId,
            type: type as NotificationType,
            message,
          });

          results.push(notification.toObject());
        } catch (error: any) {
          errors.push({ guestId, error: error.message });
        }
      }

      return res.json({
        success: true,
        data: {
          sent: results.length,
          failed: errors.length,
          notifications: results,
          errors,
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

