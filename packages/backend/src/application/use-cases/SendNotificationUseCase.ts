/**
 * Application Layer - Send Notification Use Case
 * Handles business logic for sending notifications (SMS, WhatsApp, Voice)
 */

import { Notification, NotificationType, NotificationStatus } from '../../domain/entities/Notification';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { INotificationService } from '../../domain/services/INotificationService';

export interface SendNotificationDto {
  eventId: string;
  guestId: string;
  type: NotificationType;
  message?: string;
  batchId?: string;
}

export class SendNotificationUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private notificationRepository: INotificationRepository,
    private notificationService: INotificationService
  ) {}

  async execute(dto: SendNotificationDto): Promise<Notification> {
    // Get guest
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Verify guest belongs to this event
    if (guest.eventId !== dto.eventId) {
      throw new Error('Guest does not belong to this event');
    }

    // Check if guest has phone number
    if (!guest.phone) {
      throw new Error('Guest does not have a phone number');
    }

    // Check notification limits
    const count = await this.notificationRepository.countByGuestAndType(dto.guestId, dto.type);
    const limits: Record<NotificationType, number> = {
      [NotificationType.SMS]: 2,
      [NotificationType.WHATSAPP]: 3,
      [NotificationType.VOICE]: 4,
    };

    if (count >= limits[dto.type]) {
      throw new Error(`Maximum ${limits[dto.type]} ${dto.type} notifications already sent to this guest`);
    }

    // Create message
    const message = dto.message || this.createDefaultMessage(guest.firstName, dto.type);

    // Send notification based on type
    let result;
    switch (dto.type) {
      case NotificationType.SMS:
        result = await this.notificationService.sendSMS(guest.phone, message);
        break;
      case NotificationType.WHATSAPP:
        result = await this.notificationService.sendWhatsApp(guest.phone, message);
        break;
      case NotificationType.VOICE:
        result = await this.notificationService.makeVoiceCall(guest.phone, message);
        break;
      default:
        throw new Error('Invalid notification type');
    }

    // Create notification record
    const notification = Notification.create({
      eventId: dto.eventId,
      guestId: dto.guestId,
      type: dto.type,
      status: result.status,
      message,
      phoneNumber: guest.phone,
      twilioMessageId: result.messageId,
      error: result.error,
      sentAt: new Date(),
      deliveredAt: result.status === NotificationStatus.DELIVERED ? new Date() : undefined,
      batchId: dto.batchId,
    });

    // Save notification
    const savedNotification = await this.notificationRepository.save(notification);

    // Update guest counters
    const updateData: any = {};
    if (dto.type === NotificationType.SMS) {
      updateData.smsCount = (guest.smsCount || 0) + 1;
    } else if (dto.type === NotificationType.WHATSAPP) {
      updateData.whatsappCount = (guest.whatsappCount || 0) + 1;
    } else if (dto.type === NotificationType.VOICE) {
      updateData.phoneCallCount = (guest.phoneCallCount || 0) + 1;
    }
    updateData.lastContactedAt = new Date();

    await this.guestRepository.update(dto.guestId, updateData);

    return savedNotification;
  }

  private createDefaultMessage(guestName: string, type: NotificationType): string {
    const messages: Record<NotificationType, string> = {
      [NotificationType.SMS]: `שלום ${guestName}, אנו מזמינים אותך לאירוע שלנו. נשמח לקבל אישור הגעה. תודה!`,
      [NotificationType.WHATSAPP]: `היי ${guestName} 👋\nאנו שמחים להזמין אותך לאירוע המיוחד שלנו! 💐\nנשמח לקבל אישור הגעה.\nתודה רבה! 🎉`,
      [NotificationType.VOICE]: `שלום ${guestName}. אנו מזמינים אותך לאירוע שלנו. נשמח לקבל אישור הגעה. `,
    };
    return messages[type];
  }
}

