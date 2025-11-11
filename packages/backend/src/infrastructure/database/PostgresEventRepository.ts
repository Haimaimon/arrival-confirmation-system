/**
 * Infrastructure Layer - PostgreSQL Event Repository
 */

import { Pool } from 'pg';
import { Event, EventProps, EventStatus, EventType, EventSettings, VenueInfo } from '../../domain/entities/Event';
import { IEventRepository } from '../../domain/repositories/IEventRepository';

export class PostgresEventRepository implements IEventRepository {
  constructor(private pool: Pool) {}

  async save(event: Event): Promise<Event> {
    const props = event.toObject();
    
    const query = `
      INSERT INTO events (
        id, user_id, name, type, status, event_date,
        venue_name, venue_address, venue_city, venue_latitude, venue_longitude, venue_google_maps_url,
        settings, total_invited, total_confirmed, total_declined, total_pending,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      props.id,
      props.userId,
      props.name,
      props.type,
      props.status,
      props.eventDate,
      props.venue.name,
      props.venue.address,
      props.venue.city,
      props.venue.latitude || null,
      props.venue.longitude || null,
      props.venue.googleMapsUrl || null,
      JSON.stringify(props.settings),
      props.totalInvited,
      props.totalConfirmed,
      props.totalDeclined,
      props.totalPending,
      props.createdAt,
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToEvent(result.rows[0]);
  }

  async findById(id: string): Promise<Event | null> {
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvent(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<Event[]> {
    const query = `
      SELECT * FROM events 
      WHERE user_id = $1 
      ORDER BY event_date ASC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToEvent(row));
  }

  async findByStatus(status: EventStatus): Promise<Event[]> {
    const query = `
      SELECT * FROM events 
      WHERE status = $1 
      ORDER BY event_date ASC
    `;
    const result = await this.pool.query(query, [status]);
    return result.rows.map(row => this.mapRowToEvent(row));
  }

  async findUpcoming(): Promise<Event[]> {
    const query = `
      SELECT * FROM events 
      WHERE event_date >= CURRENT_DATE 
      AND status = $1
      ORDER BY event_date ASC
      LIMIT 10
    `;
    const result = await this.pool.query(query, [EventStatus.ACTIVE]);
    return result.rows.map(row => this.mapRowToEvent(row));
  }

  async update(event: Event): Promise<Event> {
    const props = event.toObject();

    const query = `
      UPDATE events SET
        name = $1,
        type = $2,
        status = $3,
        event_date = $4,
        venue_name = $5,
        venue_address = $6,
        venue_city = $7,
        venue_latitude = $8,
        venue_longitude = $9,
        venue_google_maps_url = $10,
        settings = $11,
        total_invited = $12,
        total_confirmed = $13,
        total_declined = $14,
        total_pending = $15,
        updated_at = $16
      WHERE id = $17
      RETURNING *
    `;

    const values = [
      props.name,
      props.type,
      props.status,
      props.eventDate,
      props.venue.name,
      props.venue.address,
      props.venue.city,
      props.venue.latitude || null,
      props.venue.longitude || null,
      props.venue.googleMapsUrl || null,
      JSON.stringify(props.settings),
      props.totalInvited,
      props.totalConfirmed,
      props.totalDeclined,
      props.totalPending,
      new Date(),
      props.id,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToEvent(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM events WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToEvent(row: any): Event {
    const venue: VenueInfo = {
      name: row.venue_name,
      address: row.venue_address,
      city: row.venue_city,
      latitude: row.venue_latitude,
      longitude: row.venue_longitude,
      googleMapsUrl: row.venue_google_maps_url,
    };

    const settings: EventSettings = typeof row.settings === 'string' 
      ? JSON.parse(row.settings) 
      : row.settings;

    const props: EventProps = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as EventType,
      status: row.status as EventStatus,
      eventDate: new Date(row.event_date),
      venue,
      settings,
      totalInvited: parseInt(row.total_invited),
      totalConfirmed: parseInt(row.total_confirmed),
      totalDeclined: parseInt(row.total_declined),
      totalPending: parseInt(row.total_pending),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Event(props);
  }
}

