/**
 * Infrastructure Layer - PostgreSQL NotificationBatch Repository
 */

import { Pool } from 'pg';
import {
  NotificationBatch,
  NotificationBatchProps,
  NotificationBatchStatus,
} from '../../domain/entities/NotificationBatch';
import { INotificationBatchRepository } from '../../domain/repositories/INotificationBatchRepository';

export class PostgresNotificationBatchRepository implements INotificationBatchRepository {
  constructor(private pool: Pool) {}

  async create(batch: NotificationBatch): Promise<NotificationBatch> {
    const props = batch.toObject();
    const query = `
      INSERT INTO notification_batches (
        id, event_id, channel, message, total_recipients,
        successful_count, failed_count, skipped_count,
        status, created_by, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const values = [
      props.id,
      props.eventId,
      props.channel,
      props.message,
      props.totalRecipients,
      props.successfulCount,
      props.failedCount,
      props.skippedCount,
      props.status,
      props.createdBy || null,
      props.metadata ? JSON.stringify(props.metadata) : JSON.stringify({}),
      props.createdAt,
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  async update(batch: NotificationBatch): Promise<NotificationBatch> {
    const props = batch.toObject();
    const query = `
      UPDATE notification_batches SET
        channel = $2,
        message = $3,
        total_recipients = $4,
        successful_count = $5,
        failed_count = $6,
        skipped_count = $7,
        status = $8,
        created_by = $9,
        metadata = $10,
        updated_at = $11
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      props.id,
      props.channel,
      props.message,
      props.totalRecipients,
      props.successfulCount,
      props.failedCount,
      props.skippedCount,
      props.status,
      props.createdBy || null,
      props.metadata ? JSON.stringify(props.metadata) : JSON.stringify({}),
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<NotificationBatch | null> {
    const result = await this.pool.query('SELECT * FROM notification_batches WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRow(result.rows[0]);
  }

  async updateStatus(
    id: string,
    status: NotificationBatchStatus,
    counts?: { successful?: number; failed?: number; skipped?: number }
  ): Promise<void> {
    const fields = ['status = $2', 'updated_at = $3'];
    const values: any[] = [id, status, new Date()];
    let position = 4;

    if (counts?.successful !== undefined) {
      fields.push(`successful_count = $${position++}`);
      values.push(counts.successful);
    }
    if (counts?.failed !== undefined) {
      fields.push(`failed_count = $${position++}`);
      values.push(counts.failed);
    }
    if (counts?.skipped !== undefined) {
      fields.push(`skipped_count = $${position++}`);
      values.push(counts.skipped);
    }

    const query = `
      UPDATE notification_batches
      SET ${fields.join(', ')}
      WHERE id = $1
    `;

    await this.pool.query(query, values);
  }

  private mapRow(row: any): NotificationBatch {
    const props: NotificationBatchProps = {
      id: row.id,
      eventId: row.event_id,
      channel: row.channel,
      message: row.message,
      totalRecipients: row.total_recipients,
      successfulCount: row.successful_count,
      failedCount: row.failed_count,
      skippedCount: row.skipped_count,
      status: row.status as NotificationBatchStatus,
      createdBy: row.created_by || undefined,
      metadata: row.metadata || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new NotificationBatch(props);
  }
}


