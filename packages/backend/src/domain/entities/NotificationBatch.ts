/**
 * Domain Layer - NotificationBatch Entity
 * Represents a bulk notification sending session
 */

import { NotificationType } from './Notification';

export enum NotificationBatchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
}

export interface NotificationBatchProps {
  id: string;
  eventId: string;
  channel: NotificationType;
  message: string;
  totalRecipients: number;
  successfulCount: number;
  failedCount: number;
  skippedCount: number;
  status: NotificationBatchStatus;
  createdBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationBatch {
  private props: NotificationBatchProps;

  constructor(props: NotificationBatchProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get channel(): NotificationType {
    return this.props.channel;
  }

  get message(): string {
    return this.props.message;
  }

  get totalRecipients(): number {
    return this.props.totalRecipients;
  }

  get successfulCount(): number {
    return this.props.successfulCount;
  }

  get failedCount(): number {
    return this.props.failedCount;
  }

  get skippedCount(): number {
    return this.props.skippedCount;
  }

  get status(): NotificationBatchStatus {
    return this.props.status;
  }

  get createdBy(): string | undefined {
    return this.props.createdBy;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markProcessing(): void {
    this.props.status = NotificationBatchStatus.PROCESSING;
    this.touch();
  }

  complete(successful: number, failed: number, skipped: number): void {
    this.props.successfulCount = successful;
    this.props.failedCount = failed;
    this.props.skippedCount = skipped;
    this.props.status =
      failed > 0 ? NotificationBatchStatus.COMPLETED_WITH_ERRORS : NotificationBatchStatus.COMPLETED;
    this.touch();
  }

  fail(): void {
    this.props.status = NotificationBatchStatus.FAILED;
    this.touch();
  }

  toObject(): NotificationBatchProps {
    return { ...this.props };
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(data: Omit<NotificationBatchProps, 'id' | 'createdAt' | 'updatedAt'>): NotificationBatch {
    return new NotificationBatch({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}


