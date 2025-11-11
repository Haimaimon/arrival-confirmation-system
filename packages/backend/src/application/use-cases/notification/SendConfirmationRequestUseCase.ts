/**
 * Application Layer - Send Confirmation Request Use Case
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { INotificationService } from '../../../domain/services/INotificationService';
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from '../../../domain/entities/Notification';

export interface SendConfirmationDTO {
  guestId: string;
  type: NotificationType;         // SMS | WHATSAPP | VOICE
  customMessage?: string;
}

export class SendConfirmationRequestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private notificationRepository: INotificationRepository,
    private notificationService: INotificationService
  ) {}

  async execute(dto: SendConfirmationDTO): Promise<Notification> {
    // 1) אתחול אורח
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) throw new Error('Guest not found');

    // 2) בדיקת מגבלות שליחה (התאם לשדות שקיימים אצלך על ה-guest)
    this.validateCanSend(guest, dto.type);

    // 3) בניית הודעה
    const message = dto.customMessage || this.generateMessage(guest.fullName, dto.type);
    if (!guest) throw new Error('Guest not found');

    if (!guest.phone) {
      throw new Error('Guest has no phone number');
    }
    const phone = guest.phone; // כאן זה נהיה string בלבד (narrowed)
    // 4) יצירת ישות notification לפי ה-Entity הקיים (אין recipient/purpose/markAsSent)
    const notification = Notification.create({
      eventId: guest.eventId,
      guestId: guest.id,
      type: dto.type,
      status: NotificationStatus.PENDING,
      message,
      phoneNumber: phone,
      sentAt: new Date(),
      // deliveredAt: undefined, twilioMessageId: undefined, error: undefined  // אופציונלי
    });

    // 5) שליחה בפועל
    let ok = true;
    try {
      if (dto.type === NotificationType.SMS) {
        await this.notificationService.sendSMS(phone, message);
        // אם יש לך מונים ב-guest:
        if (typeof guest.markSmsSent === 'function') guest.markSmsSent();
      } else if (dto.type === NotificationType.WHATSAPP) {
        await this.notificationService.sendWhatsApp(phone, message);
        if (typeof guest.markWhatsAppSent === 'function') guest.markWhatsAppSent();
      } else if (dto.type === NotificationType.VOICE) {
        // כרגע אין מימוש makePhoneCall בממשק; אם אין לך שירות קולי – זרוק שגיאה ידידותית:
        throw new Error('Voice calls are not supported');
      }
    } catch (e: any) {
      ok = false;
      notification.markAsFailed(e?.message || 'Unknown error');
    }

    // 6) עדכון סטטוס
    if (ok) {
      notification.updateStatus(NotificationStatus.SENT);
    }

    // 7) שמירה ל-DB
    await this.notificationRepository.save(notification);

    // 8) עדכון מונים לאורח (התאם לשדות שקיימים)
    const updateData: any = { lastContactedAt: new Date() };
    if (dto.type === NotificationType.SMS) {
      updateData.smsCount = (guest.smsCount || 0) + 1;
    } else if (dto.type === NotificationType.WHATSAPP) {
      updateData.whatsappCount = (guest.whatsappCount || 0) + 1;
    } else if (dto.type === NotificationType.VOICE) {
      updateData.phoneCallCount = (guest.phoneCallCount || 0) + 1;
    }
    await this.guestRepository.update(guest.id, updateData);

    return notification;
  }

  private validateCanSend(guest: any, type: NotificationType): void {
    switch (type) {
      case NotificationType.SMS:
        if (typeof guest.canSendSms === 'function' && !guest.canSendSms()) {
          throw new Error('SMS limit reached for this guest');
        }
        break;
      case NotificationType.WHATSAPP:
        if (typeof guest.canSendWhatsApp === 'function' && !guest.canSendWhatsApp()) {
          throw new Error('WhatsApp limit reached for this guest');
        }
        break;
      case NotificationType.VOICE:
        // אם אין תמיכה – נאסור מראש:
        throw new Error('Voice calls are not supported');
    }
  }

  private generateMessage(guestName: string, type: NotificationType): string {
    const base = `שלום ${guestName}, מזמינים אותך לאירוע שלנו! נשמח לאישור הגעתך.`;
    if (type === NotificationType.VOICE) {
      return `${base} אנא לחץ 1 לאישור, 2 לסירוב.`;
    }
    return `${base} לאישור לחץ כאן: [קישור]`;
  }
}
