/**
 * Application Layer - Assign Guest to Table Use Case
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { ITableRepository } from '../../../domain/repositories/ITableRepository';
import { Guest } from '../../../domain/entities/Guest';

export interface AssignGuestDto {
  guestId: string;
  tableNumber: number | null; // null to unassign
}

export class AssignGuestToTableUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private tableRepository: ITableRepository
  ) {}

  async execute(dto: AssignGuestDto): Promise<Guest> {
    // Get guest
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // If assigning to a table, verify it exists and has capacity
    if (dto.tableNumber !== null) {
      const table = await this.tableRepository.findByTableNumber(
        guest.eventId,
        dto.tableNumber
      );
      
      if (!table) {
        throw new Error('Table not found');
      }

      // Check capacity (optional - you might want to allow overbooking)
      const guestsAtTable = await this.guestRepository.findByFilters({
        eventId: guest.eventId,
        tableNumber: dto.tableNumber,
      });

      const currentOccupied = guestsAtTable.reduce(
        (sum, g) => sum + (g.numberOfGuests || 0),
        0
      );

      const newOccupied = currentOccupied + guest.numberOfGuests;

      if (newOccupied > table.capacity) {
        throw new Error(
          `Table ${dto.tableNumber} has capacity ${table.capacity} but would have ${newOccupied} guests`
        );
      }
    }

    // Update guest's table assignment
    const updatedGuest = await this.guestRepository.update(dto.guestId, {
      tableNumber: dto.tableNumber,
    });

    return updatedGuest;
  }
}

