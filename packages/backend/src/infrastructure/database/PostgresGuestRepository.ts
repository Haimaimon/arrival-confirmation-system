/**
 * Infrastructure Layer - PostgreSQL Guest Repository Implementation
 */

import { Pool } from 'pg';
import { Guest, GuestProps, GuestStatus, GuestType } from '../../domain/entities/Guest';
import { IGuestRepository, GuestFilters } from '../../domain/repositories/IGuestRepository';

export class PostgresGuestRepository implements IGuestRepository {
  constructor(private pool: Pool) {}

  async save(guest: Guest): Promise<Guest> {
    const props = guest.toObject();
    const query = `
      INSERT INTO guests (
        id, event_id, first_name, last_name, phone, email, type, status,
        number_of_guests, table_number, seat_number, notes,
        sms_count, whatsapp_count, phone_call_count,
        last_contacted_at, confirmed_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *
    `;

    const values = [
      props.id,
      props.eventId,
      props.firstName,
      props.lastName,
      props.phone,
      props.email,
      props.type,
      props.status,
      props.numberOfGuests,
      props.tableNumber,
      props.seatNumber,
      props.notes,
      props.smsCount,
      props.whatsappCount,
      props.phoneCallCount,
      props.lastContactedAt,
      props.confirmedAt,
      props.createdAt,
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToGuest(result.rows[0]);
  }

  async findById(id: string): Promise<Guest | null> {
    const query = 'SELECT * FROM guests WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToGuest(result.rows[0]) : null;
  }

  async findByEventId(eventId: string): Promise<Guest[]> {
    const query = 'SELECT * FROM guests WHERE event_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [eventId]);
    return result.rows.map(row => this.mapRowToGuest(row));
  }

  async findByFilters(filters: GuestFilters): Promise<Guest[]> {
    let query = 'SELECT * FROM guests WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.eventId) {
      query += ` AND event_id = $${paramCount}`;
      values.push(filters.eventId);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.tableNumber !== undefined) {
      query += ` AND table_number = $${paramCount}`;
      values.push(filters.tableNumber);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR phone LIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToGuest(row));
  }

  async update(id: string, data: any): Promise<Guest> {
    // First, get the existing guest
    const existingGuest = await this.findById(id);
    if (!existingGuest) {
      throw new Error('Guest not found');
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (data.firstName !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(data.firstName);
      paramCount++;
    }

    if (data.lastName !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(data.lastName);
      paramCount++;
    }

    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(data.phone);
      paramCount++;
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }

    if (data.type !== undefined) {
      updates.push(`type = $${paramCount}`);
      values.push(data.type);
      paramCount++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }

    if (data.numberOfGuests !== undefined) {
      updates.push(`number_of_guests = $${paramCount}`);
      values.push(data.numberOfGuests);
      paramCount++;
    }

    if (data.tableNumber !== undefined) {
      updates.push(`table_number = $${paramCount}`);
      values.push(data.tableNumber);
      paramCount++;
    }

    if (data.seatNumber !== undefined) {
      updates.push(`seat_number = $${paramCount}`);
      values.push(data.seatNumber);
      paramCount++;
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(data.notes);
      paramCount++;
    }

    if (data.smsCount !== undefined) {
      updates.push(`sms_count = $${paramCount}`);
      values.push(data.smsCount);
      paramCount++;
    }

    if (data.whatsappCount !== undefined) {
      updates.push(`whatsapp_count = $${paramCount}`);
      values.push(data.whatsappCount);
      paramCount++;
    }

    if (data.phoneCallCount !== undefined) {
      updates.push(`phone_call_count = $${paramCount}`);
      values.push(data.phoneCallCount);
      paramCount++;
    }

    if (data.lastContactedAt !== undefined) {
      updates.push(`last_contacted_at = $${paramCount}`);
      values.push(data.lastContactedAt);
      paramCount++;
    }

    if (data.confirmedAt !== undefined) {
      updates.push(`confirmed_at = $${paramCount}`);
      values.push(data.confirmedAt);
      paramCount++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    if (updates.length === 1) { // Only updated_at was added
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE guests SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapRowToGuest(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM guests WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async bulkSave(guests: Guest[]): Promise<Guest[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const savedGuests: Guest[] = [];
      for (const guest of guests) {
        const props = guest.toObject();
        const query = `
          INSERT INTO guests (
            id, event_id, first_name, last_name, phone, email, type, status,
            number_of_guests, table_number, seat_number, notes,
            sms_count, whatsapp_count, phone_call_count,
            last_contacted_at, confirmed_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          )
          RETURNING *
        `;

        const values = [
          props.id,
          props.eventId,
          props.firstName,
          props.lastName,
          props.phone,
          props.email,
          props.type,
          props.status,
          props.numberOfGuests,
          props.tableNumber,
          props.seatNumber,
          props.notes,
          props.smsCount,
          props.whatsappCount,
          props.phoneCallCount,
          props.lastContactedAt,
          props.confirmedAt,
          props.createdAt,
          props.updatedAt,
        ];

        const result = await client.query(query, values);
        savedGuests.push(this.mapRowToGuest(result.rows[0]));
      }

      await client.query('COMMIT');
      return savedGuests;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async countByEventId(eventId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM guests WHERE event_id = $1';
    const result = await this.pool.query(query, [eventId]);
    return parseInt(result.rows[0].count, 10);
  }

  async countByStatus(eventId: string, status: GuestStatus): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM guests WHERE event_id = $1 AND status = $2';
    const result = await this.pool.query(query, [eventId, status]);
    return parseInt(result.rows[0].count, 10);
  }

  private mapRowToGuest(row: any): Guest {
    const props: GuestProps = {
      id: row.id,
      eventId: row.event_id,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      type: row.type as GuestType,
      status: row.status as GuestStatus,
      numberOfGuests: row.number_of_guests,
      tableNumber: row.table_number,
      seatNumber: row.seat_number,
      notes: row.notes,
      smsCount: row.sms_count,
      whatsappCount: row.whatsapp_count,
      phoneCallCount: row.phone_call_count,
      lastContactedAt: row.last_contacted_at,
      confirmedAt: row.confirmed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new Guest(props);
  }
}

