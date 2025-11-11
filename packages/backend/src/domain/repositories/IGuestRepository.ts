/**
 * Domain Layer - Guest Repository Interface
 * Defines contract for guest data access
 */

import { Guest, GuestStatus } from '../entities/Guest';

export interface GuestFilters {
  eventId?: string;
  status?: GuestStatus;
  tableNumber?: number;
  search?: string;
}

export interface IGuestRepository {
  save(guest: Guest): Promise<Guest>;
  findById(id: string): Promise<Guest | null>;
  findByEventId(eventId: string): Promise<Guest[]>;
  findByFilters(filters: GuestFilters): Promise<Guest[]>;
  update(id: string, data: any): Promise<Guest>; // Use 'any' for flexible partial updates
  delete(id: string): Promise<void>;
  bulkSave(guests: Guest[]): Promise<Guest[]>;
  countByEventId(eventId: string): Promise<number>;
  countByStatus(eventId: string, status: GuestStatus): Promise<number>;
}

