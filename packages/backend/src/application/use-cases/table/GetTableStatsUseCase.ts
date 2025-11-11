/**
 * Application Layer - Get Table Stats Use Case
 * Returns detailed statistics about tables and seating
 */

import { ITableRepository } from '../../../domain/repositories/ITableRepository';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export interface TableWithStats {
  id: string;
  tableNumber: number;
  capacity: number;
  occupiedSeats: number;
  section?: string;
  notes?: string;
  guests: Array<{
    id: string;
    name: string;
    numberOfGuests: number;
  }>;
}

export interface SeatingStats {
  totalTables: number;
  totalCapacity: number;
  totalOccupied: number;
  emptySeats: number;
  tables: TableWithStats[];
}

export class GetTableStatsUseCase {
  constructor(
    private tableRepository: ITableRepository,
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(eventId: string): Promise<SeatingStats> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all tables for this event
    const tables = await this.tableRepository.findByEventId(eventId);

    // Get all guests for this event
    const allGuests = await this.guestRepository.findByEventId(eventId);

    // Calculate stats for each table
    const tablesWithStats: TableWithStats[] = tables.map(table => {
      // Find guests assigned to this table
      const tableGuests = allGuests.filter(
        guest => guest.tableNumber === table.tableNumber
      );

      // Calculate occupied seats
      const occupiedSeats = tableGuests.reduce(
        (sum, guest) => sum + (guest.numberOfGuests || 0),
        0
      );

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        occupiedSeats,
        section: table.section,
        notes: table.notes,
        guests: tableGuests.map(g => ({
          id: g.id,
          name: `${g.firstName} ${g.lastName}`,
          numberOfGuests: g.numberOfGuests,
        })),
      };
    });

    // Calculate overall stats
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const totalOccupied = tablesWithStats.reduce((sum, t) => sum + t.occupiedSeats, 0);
    const emptySeats = totalCapacity - totalOccupied;

    return {
      totalTables,
      totalCapacity,
      totalOccupied,
      emptySeats,
      tables: tablesWithStats,
    };
  }
}

