/**
 * Infrastructure Layer - PostgreSQL Notification Repository Implementation
 */

import { Pool } from 'pg';
import {
  Notification,
  NotificationProps,
  NotificationType,
  NotificationStatus,
} from '../../domain/entities/Notification';
import { INotificationRepository, NotificationFilters } from '../../domain/repositories/INotificationRepository';

export class PostgresNotificationRepository implements INotificationRepository {
  constructor(private pool: Pool) {}

  async save(notification: Notification): Promise<Notification> {
    const props = notification.toObject();
    const query = `
      INSERT INTO notifications (
        id, event_id, guest_id, type, status, message, phone_number,
        twilio_message_id, error, sent_at, delivered_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const values = [
      props.id,
      props.eventId,
      props.guestId,
      props.type,
      props.status,
      props.message,
      props.phoneNumber,
      props.twilioMessageId,
      props.error,
      props.sentAt,
      props.deliveredAt,
      props.createdAt,
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToNotification(result.rows[0]);
  }

  async findById(id: string): Promise<Notification | null> {
    const query = 'SELECT * FROM notifications WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToNotification(result.rows[0]) : null;
  }

  async findByFilters(filters: NotificationFilters): Promise<Notification[]> {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.eventId) {
      query += ` AND event_id = $${paramCount}`;
      values.push(filters.eventId);
      paramCount++;
    }

    if (filters.guestId) {
      query += ` AND guest_id = $${paramCount}`;
      values.push(filters.guestId);
      paramCount++;
    }

    if (filters.type) {
      query += ` AND type = $${paramCount}`;
      values.push(filters.type);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToNotification(row));
  }

  async findByEventId(eventId: string): Promise<Notification[]> {
    const query = 'SELECT * FROM notifications WHERE event_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [eventId]);
    return result.rows.map(row => this.mapRowToNotification(row));
  }

  async findByGuestId(guestId: string): Promise<Notification[]> {
    const query = 'SELECT * FROM notifications WHERE guest_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [guestId]);
    return result.rows.map(row => this.mapRowToNotification(row));
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const existingNotification = await this.findById(id);
    if (!existingNotification) {
      throw new Error('Notification not found');
    }

    const updates: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (data.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }

    if (data.error !== undefined) {
      updates.push(`error = $${paramCount}`);
      values.push(data.error);
      paramCount++;
    }

    if (data.deliveredAt !== undefined) {
      updates.push(`delivered_at = $${paramCount}`);
      values.push(data.deliveredAt);
      paramCount++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    if (updates.length === 1) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE notifications SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapRowToNotification(result.rows[0]);
  }

  async countByGuestAndType(guestId: string, type: NotificationType): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE guest_id = $1 AND type = $2';
    const result = await this.pool.query(query, [guestId, type]);
    return parseInt(result.rows[0].count, 10);
  }

  private mapRowToNotification(row: any): Notification {
    const props: NotificationProps = {
      id: row.id,
      eventId: row.event_id,
      guestId: row.guest_id,
      type: row.type as NotificationType,
      status: row.status as NotificationStatus,
      message: row.message,
      phoneNumber: row.phone_number,
      twilioMessageId: row.twilio_message_id,
      error: row.error,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new Notification(props);
  }
}

