/**
 * Domain Layer - Event Repository Interface
 */

import { Event, EventStatus } from '../entities/Event';

export interface IEventRepository {
  save(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findByUserId(userId: string): Promise<Event[]>;
  findByStatus(status: EventStatus): Promise<Event[]>;
  findUpcoming(): Promise<Event[]>;
  update(event: Event): Promise<Event>;
  delete(id: string): Promise<void>;
}

