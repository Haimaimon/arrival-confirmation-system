/**
 * Domain Layer - Notification Repository Interface
 * Defines contract for notification data access
 */

import { Notification, NotificationType, NotificationStatus } from '../entities/Notification';

export interface NotificationFilters {
  eventId?: string;
  guestId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
}

export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByFilters(filters: NotificationFilters): Promise<Notification[]>;
  findByEventId(eventId: string): Promise<Notification[]>;
  findByGuestId(guestId: string): Promise<Notification[]>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  countByGuestAndType(guestId: string, type: NotificationType): Promise<number>;
}
