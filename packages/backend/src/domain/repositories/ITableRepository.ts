/**
 * Domain Layer - Table Repository Interface
 */

import { Table } from '../entities/Table';

export interface ITableRepository {
  save(table: Table): Promise<Table>;
  findById(id: string): Promise<Table | null>;
  findByEventId(eventId: string): Promise<Table[]>;
  update(id: string, data: any): Promise<Table>;
  delete(id: string): Promise<void>;
  findByTableNumber(eventId: string, tableNumber: number): Promise<Table | null>;
  countByEventId(eventId: string): Promise<number>;
}
