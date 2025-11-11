/**
 * Application Layer - Update Table Use Case
 */

import { Table } from '../../../domain/entities/Table';
import { ITableRepository } from '../../../domain/repositories/ITableRepository';

export interface UpdateTableDto {
  tableId: string;
  tableNumber?: number;
  capacity?: number;
  section?: string;
  notes?: string;
}

export class UpdateTableUseCase {
  constructor(private tableRepository: ITableRepository) {}

  async execute(dto: UpdateTableDto): Promise<Table> {
    // Get existing table
    const existingTable = await this.tableRepository.findById(dto.tableId);
    if (!existingTable) {
      throw new Error('Table not found');
    }

    // If changing table number, check it's not taken
    if (dto.tableNumber !== undefined && dto.tableNumber !== existingTable.tableNumber) {
      const conflictingTable = await this.tableRepository.findByTableNumber(
        existingTable.eventId,
        dto.tableNumber
      );
      if (conflictingTable) {
        throw new Error(`Table number ${dto.tableNumber} already exists for this event`);
      }
    }

    // Validate capacity if provided
    if (dto.capacity !== undefined) {
      if (dto.capacity < 1) {
        throw new Error('Capacity must be at least 1');
      }
      if (dto.capacity > 24) {
        throw new Error('Capacity cannot exceed 24 seats per table');
      }
    }

    // Build update data
    const updateData: any = {};
    if (dto.tableNumber !== undefined) updateData.tableNumber = dto.tableNumber;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
    if (dto.section !== undefined) updateData.section = dto.section || null;
    if (dto.notes !== undefined) updateData.notes = dto.notes || null;

    // Update table
    const updatedTable = await this.tableRepository.update(dto.tableId, updateData);

    return updatedTable;
  }
}

