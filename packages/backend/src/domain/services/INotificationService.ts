/**
 * Domain Layer - Notification Service Interface
 * Defines contract for sending notifications via SMS, WhatsApp, and Voice calls
 */

export enum NotificationType {
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  VOICE = 'VOICE',
}

export enum NotificationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface SendNotificationRequest {
  to: string;
  message: string;
  type: NotificationType;
  eventId: string;
  guestId: string;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  status: NotificationStatus;
  error?: string;
}

export interface INotificationService {
  sendSMS(to: string, message: string): Promise<NotificationResponse>;
  sendWhatsApp(to: string, message: string): Promise<NotificationResponse>;
  makeVoiceCall(to: string, message: string): Promise<NotificationResponse>;
  getMessageStatus(messageId: string): Promise<NotificationStatus>;
}
