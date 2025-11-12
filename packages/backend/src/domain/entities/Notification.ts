/**
 * Domain Layer - Notification Entity
 * Represents a notification (SMS, WhatsApp, or Voice call) sent to a guest
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

export interface NotificationProps {
  id: string;
  eventId: string;
  guestId: string;
  type: NotificationType;
  status: NotificationStatus;
  message: string;
  phoneNumber: string;
  twilioMessageId?: string;
  error?: string;
  batchId?: string;
  sentAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get guestId(): string {
    return this.props.guestId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get status(): NotificationStatus {
    return this.props.status;
  }

  get message(): string {
    return this.props.message;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get twilioMessageId(): string | undefined {
    return this.props.twilioMessageId;
  }

  get batchId(): string | undefined {
    return this.props.batchId;
  }

  get error(): string | undefined {
    return this.props.error;
  }

  get sentAt(): Date {
    return this.props.sentAt;
  }

  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateStatus(status: NotificationStatus, deliveredAt?: Date): void {
    this.props.status = status;
    if (deliveredAt) {
      this.props.deliveredAt = deliveredAt;
    }
    this.props.updatedAt = new Date();
  }

  markAsDelivered(): void {
    this.props.status = NotificationStatus.DELIVERED;
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsFailed(error: string): void {
    this.props.status = NotificationStatus.FAILED;
    this.props.error = error;
    this.props.updatedAt = new Date();
  }

  toObject(): NotificationProps {
    return { ...this.props };
  }

  static create(data: Omit<NotificationProps, 'id' | 'createdAt' | 'updatedAt'>): Notification {
    return new Notification({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    [NotificationType.SMS]: 'SMS',
    [NotificationType.WHATSAPP]: 'WhatsApp',
    [NotificationType.VOICE]: 'שיחה קולית',
  };
  return labels[type];
};

export const getNotificationStatusLabel = (status: NotificationStatus): string => {
  const labels: Record<NotificationStatus, string> = {
    [NotificationStatus.SENT]: 'נשלח',
    [NotificationStatus.DELIVERED]: 'נמסר',
    [NotificationStatus.FAILED]: 'נכשל',
    [NotificationStatus.PENDING]: 'ממתין',
  };
  return labels[status];
};

