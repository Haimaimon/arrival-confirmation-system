/**
 * Application Layer - Send Bulk Notifications Use Case
 */

import { NotificationType } from '../../../domain/entities/Notification';
import {
  NotificationBatch,
  NotificationBatchStatus,
} from '../../../domain/entities/NotificationBatch';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { INotificationBatchRepository } from '../../../domain/repositories/INotificationBatchRepository';
import { INotificationService } from '../../../domain/services/INotificationService';
import { SendNotificationUseCase } from '../SendNotificationUseCase';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

interface SendBulkNotificationsDto {
  eventId: string;
  guestIds?: string[];
  type: NotificationType;
  message?: string;
  initiatedBy?: string;
}

interface BulkNotificationError {
  guestId: string;
  reason: string;
}

interface BulkNotificationResult {
  batch: NotificationBatch;
  successful: number;
  failed: number;
  skipped: number;
  errors: BulkNotificationError[];
}

export class SendBulkNotificationsUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private notificationRepository: INotificationRepository,
    private notificationBatchRepository: INotificationBatchRepository,
    private notificationService: INotificationService
  ) {}

  async execute(dto: SendBulkNotificationsDto): Promise<BulkNotificationResult> {
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const guests = await this.guestRepository.findByEventId(dto.eventId);
    if (guests.length === 0) {
      throw new Error('No guests found for this event');
    }

    const guestMap = new Map(guests.map((guest) => [guest.id, guest]));
    let targetGuestIds: string[];

    if (dto.guestIds && dto.guestIds.length > 0) {
      const uniqueGuestIds = Array.from(new Set(dto.guestIds));
      targetGuestIds = uniqueGuestIds.filter((id) => guestMap.has(id));
    } else {
      targetGuestIds = guests.map((guest) => guest.id);
    }

    if (targetGuestIds.length === 0) {
      throw new Error('No valid guests selected for bulk notification');
    }

    const batch = NotificationBatch.create({
      eventId: dto.eventId,
      channel: dto.type,
      message: dto.message || '',
      totalRecipients: targetGuestIds.length,
      successfulCount: 0,
      failedCount: 0,
      skippedCount: 0,
      status: NotificationBatchStatus.PENDING,
      createdBy: dto.initiatedBy,
      metadata: {
        messagePreview: dto.message?.slice(0, 120) || null,
      },
    });

    const createdBatch = await this.notificationBatchRepository.create(batch);
    createdBatch.markProcessing();
    await this.notificationBatchRepository.update(createdBatch);

    const sendNotificationUseCase = new SendNotificationUseCase(
      this.guestRepository,
      this.notificationRepository,
      this.notificationService
    );

    let successful = 0;
    let failed = 0;
    let skipped = 0;
    const errors: BulkNotificationError[] = [];

    for (const guestId of targetGuestIds) {
      const guest = guestMap.get(guestId);

      if (!guest) {
        failed++;
        errors.push({ guestId, reason: 'Guest not found' });
        continue;
      }

      if (!guest.phone) {
        skipped++;
        errors.push({ guestId, reason: 'Guest does not have a phone number' });
        continue;
      }

      const personalizedMessage = this.renderMessage(
        dto.message,
        guest.firstName,
        guest.lastName,
        event.name
      );

      try {
        await sendNotificationUseCase.execute({
          eventId: dto.eventId,
          guestId,
          type: dto.type,
          message: personalizedMessage,
          batchId: createdBatch.id,
        });
        successful++;
      } catch (error: any) {
        failed++;
        errors.push({ guestId, reason: error.message || 'Unknown error' });
      }
    }

    createdBatch.complete(successful, failed, skipped);
    await this.notificationBatchRepository.update(createdBatch);

    return {
      batch: createdBatch,
      successful,
      failed,
      skipped,
      errors,
    };
  }

  private renderMessage(
    template: string | undefined,
    firstName: string,
    lastName: string,
    eventName?: string
  ): string | undefined {
    if (!template || template.trim().length === 0) {
      return undefined;
    }

    const replacements: Record<string, string> = {
      '{{firstName}}': firstName,
      '{{lastName}}': lastName,
      '{{fullName}}': `${firstName} ${lastName}`.trim(),
      '{{eventName}}': eventName || '',
    };

    let rendered = template;
    for (const [token, value] of Object.entries(replacements)) {
      rendered = rendered.replace(new RegExp(token, 'g'), value);
    }

    return rendered;
  }
}


