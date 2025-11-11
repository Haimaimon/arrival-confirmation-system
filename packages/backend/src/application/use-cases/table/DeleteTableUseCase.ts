/**
 * Application Layer - Delete Table Use Case
 */

import { ITableRepository } from '../../../domain/repositories/ITableRepository';

export class DeleteTableUseCase {
  constructor(
    private tableRepository: ITableRepository
  ) {}

  async execute(tableId: string): Promise<void> {
    // Get existing table
    const table = await this.tableRepository.findById(tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    // Delete table
    // Note: Guests assigned to this table will be automatically unassigned
    // by the frontend when they detect the table no longer exists
    await this.tableRepository.delete(tableId);
  }
}

