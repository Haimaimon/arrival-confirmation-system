/**
 * Application Layer - Create Table Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Table, TableProps } from '../../../domain/entities/Table';
import { ITableRepository } from '../../../domain/repositories/ITableRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export interface CreateTableDto {
  eventId: string;
  tableNumber: number;
  capacity: number;
  section?: string;
  notes?: string;
}

export class CreateTableUseCase {
  constructor(
    private tableRepository: ITableRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(dto: CreateTableDto): Promise<Table> {
    // Verify event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if table number already exists for this event
    const existingTable = await this.tableRepository.findByTableNumber(
      dto.eventId,
      dto.tableNumber
    );
    if (existingTable) {
      throw new Error(`Table number ${dto.tableNumber} already exists for this event`);
    }

    // Validate capacity
    if (dto.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (dto.capacity > 24) {
      throw new Error('Capacity cannot exceed 24 seats per table');
    }

    // Create table entity
    const tableProps: TableProps = {
      id: uuidv4(),
      eventId: dto.eventId,
      tableNumber: dto.tableNumber,
      capacity: dto.capacity,
      section: dto.section,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const table = new Table(tableProps);

    // Save to repository
    const savedTable = await this.tableRepository.save(table);

    return savedTable;
  }
}

