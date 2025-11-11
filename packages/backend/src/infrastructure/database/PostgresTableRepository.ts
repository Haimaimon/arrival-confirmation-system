/**
 * Infrastructure Layer - PostgreSQL Table Repository
 */

import { Pool } from 'pg';
import { Table, TableProps } from '../../domain/entities/Table';
import { ITableRepository } from '../../domain/repositories/ITableRepository';

export class PostgresTableRepository implements ITableRepository {
  constructor(private pool: Pool) {}

  async save(table: Table): Promise<Table> {
    const props = table.toObject();
    const query = `
      INSERT INTO tables (
        id, event_id, table_number, capacity, section, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      props.id,
      props.eventId,
      props.tableNumber,
      props.capacity,
      props.section,
      props.notes,
      props.createdAt,
      props.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToTable(result.rows[0]);
  }

  async findById(id: string): Promise<Table | null> {
    const query = 'SELECT * FROM tables WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToTable(result.rows[0]) : null;
  }

  async findByEventId(eventId: string): Promise<Table[]> {
    const query = 'SELECT * FROM tables WHERE event_id = $1 ORDER BY table_number ASC';
    const result = await this.pool.query(query, [eventId]);
    return result.rows.map(row => this.mapRowToTable(row));
  }

  async findByTableNumber(eventId: string, tableNumber: number): Promise<Table | null> {
    const query = 'SELECT * FROM tables WHERE event_id = $1 AND table_number = $2';
    const result = await this.pool.query(query, [eventId, tableNumber]);
    return result.rows.length > 0 ? this.mapRowToTable(result.rows[0]) : null;
  }

  async update(id: string, data: any): Promise<Table> {
    const existingTable = await this.findById(id);
    if (!existingTable) {
      throw new Error('Table not found');
    }

    const updates: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (data.tableNumber !== undefined) {
      updates.push(`table_number = $${paramCount}`);
      values.push(data.tableNumber);
      paramCount++;
    }

    if (data.capacity !== undefined) {
      updates.push(`capacity = $${paramCount}`);
      values.push(data.capacity);
      paramCount++;
    }

    if (data.section !== undefined) {
      updates.push(`section = $${paramCount}`);
      values.push(data.section);
      paramCount++;
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(data.notes);
      paramCount++;
    }

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    if (updates.length === 1) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE tables SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapRowToTable(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM tables WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async countByEventId(eventId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM tables WHERE event_id = $1';
    const result = await this.pool.query(query, [eventId]);
    return parseInt(result.rows[0].count, 10);
  }

  private mapRowToTable(row: any): Table {
    const props: TableProps = {
      id: row.id,
      eventId: row.event_id,
      tableNumber: row.table_number,
      capacity: row.capacity,
      section: row.section,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new Table(props);
  }
}

