/**
 * Domain Layer - Table Entity (Frontend)
 */

export interface Table {
  id: string;
  eventId: string;
  tableNumber: number;
  capacity: number;
  section?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TableWithStats extends Table {
  occupiedSeats: number;
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

export interface CreateTableDto {
  eventId: string;
  tableNumber: number;
  capacity: number;
  section?: string;
  notes?: string;
}

export interface UpdateTableDto {
  tableNumber?: number;
  capacity?: number;
  section?: string;
  notes?: string;
}

export interface AssignGuestDto {
  guestId: string;
  tableNumber: number | null;
}

