/**
 * Application Layer - Send Confirmation Request Use Case
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { INotificationService } from '../../../domain/services/INotificationService';
import {
  Notification,
  NotificationProps,
  NotificationType,
  NotificationStatus,
  NotificationPurpose,
} from '../../../domain/entities/Notification';
import { v4 as uuidv4 } from 'uuid';

export interface SendConfirmationDTO {
  guestId: string;
  type: NotificationType;
  customMessage?: string;
}

export class SendConfirmationRequestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private notificationRepository: INotificationRepository,
    private notificationService: INotificationService
  ) {}

  async execute(dto: SendConfirmationDTO): Promise<Notification> {
    // Find guest
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Check if can send
    this.validateCanSend(guest, dto.type);

    // Generate message
    const message = dto.customMessage || this.generateMessage(guest.fullName, dto.type);

    // Create notification entity
    const notificationProps: NotificationProps = {
      id: uuidv4(),
      eventId: guest.eventId,
      guestId: guest.id,
      type: dto.type,
      purpose: NotificationPurpose.CONFIRMATION_REQUEST,
      status: NotificationStatus.PENDING,
      recipient: guest.phone,
      message,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = new Notification(notificationProps);

    // Send notification
    let result: { success: boolean; messageId?: string; error?: string };

    switch (dto.type) {
      case NotificationType.SMS:
        result = await this.notificationService.sendSms({
          to: guest.phone,
          message,
        });
        guest.markSmsSent();
        break;

      case NotificationType.WHATSAPP:
        result = await this.notificationService.sendWhatsApp({
          to: guest.phone,
          message,
        });
        guest.markWhatsAppSent();
        break;

      case NotificationType.PHONE_CALL:
        result = await this.notificationService.makePhoneCall({
          to: guest.phone,
          message,
        });
        guest.markPhoneCallMade();
        break;

      default:
        throw new Error('Unsupported notification type');
    }

    // Update notification status
    if (result.success) {
      notification.markAsSent();
    } else {
      notification.markAsFailed(result.error || 'Unknown error');
    }

    // Save
    await this.notificationRepository.save(notification);
    
    // Update guest counters
    const updateData: any = {};
    if (dto.type === NotificationType.SMS) {
      updateData.smsCount = (guest.smsCount || 0) + 1;
    } else if (dto.type === NotificationType.WHATSAPP) {
      updateData.whatsappCount = (guest.whatsappCount || 0) + 1;
    } else if (dto.type === NotificationType.PHONE_CALL) {
      updateData.phoneCallCount = (guest.phoneCallCount || 0) + 1;
    }
    updateData.lastContactedAt = new Date();
    
    await this.guestRepository.update(guest.id, updateData);

    return notification;
  }

  private validateCanSend(guest: any, type: NotificationType): void {
    switch (type) {
      case NotificationType.SMS:
        if (!guest.canSendSms()) {
          throw new Error('SMS limit reached for this guest');
        }
        break;
      case NotificationType.WHATSAPP:
        if (!guest.canSendWhatsApp()) {
          throw new Error('WhatsApp limit reached for this guest');
        }
        break;
      case NotificationType.PHONE_CALL:
        if (!guest.canMakePhoneCall()) {
          throw new Error('Phone call limit reached for this guest');
        }
        break;
    }
  }

  private generateMessage(guestName: string, type: NotificationType): string {
    const baseMessage = `שלום ${guestName}, מזמינים אותך לאירוע שלנו! נשמח לאישור הגעתך.`;
    
    if (type === NotificationType.PHONE_CALL) {
      return `${baseMessage} אנא לחץ 1 לאישור, 2 לסירוב.`;
    }
    
    return `${baseMessage} לאישור לחץ כאן: [קישור]`;
  }
}

