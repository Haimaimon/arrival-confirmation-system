/**
 * Domain Layer - Notification Batch Repository Interface
 */

import { NotificationBatch, NotificationBatchStatus } from '../entities/NotificationBatch';

export interface INotificationBatchRepository {
  create(batch: NotificationBatch): Promise<NotificationBatch>;
  update(batch: NotificationBatch): Promise<NotificationBatch>;
  findById(id: string): Promise<NotificationBatch | null>;
  updateStatus(
    id: string,
    status: NotificationBatchStatus,
    counts?: { successful?: number; failed?: number; skipped?: number }
  ): Promise<void>;
}


