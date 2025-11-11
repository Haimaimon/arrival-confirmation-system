/**
 * Infrastructure Layer - Table API Client
 */

import { apiClient } from './apiClient';
import {
  Table,
  TableWithStats,
  SeatingStats,
  CreateTableDto,
  UpdateTableDto,
  AssignGuestDto,
} from '../../domain/entities/Table';

export const tableApi = {
  /**
   * Create a new table
   */
  async createTable(data: CreateTableDto): Promise<Table> {
    const response = await apiClient.post<{ success: boolean; data: Table }>(
      '/tables',
      data
    );
    return response.data.data;
  },

  /**
   * Get table statistics for an event
   */
  async getTableStats(eventId: string): Promise<SeatingStats> {
    const response = await apiClient.get<{ success: boolean; data: SeatingStats }>(
      `/tables/event/${eventId}/stats`
    );
    return response.data.data;
  },

  /**
   * Get all tables for an event
   */
  async getTables(eventId: string): Promise<Table[]> {
    const response = await apiClient.get<{ success: boolean; data: Table[] }>(
      `/tables/event/${eventId}`
    );
    return response.data.data;
  },

  /**
   * Update a table
   */
  async updateTable(id: string, data: UpdateTableDto): Promise<Table> {
    const response = await apiClient.put<{ success: boolean; data: Table }>(
      `/tables/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a table
   */
  async deleteTable(id: string): Promise<void> {
    await apiClient.delete(`/tables/${id}`);
  },

  /**
   * Assign guest to table
   */
  async assignGuestToTable(data: AssignGuestDto): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/tables/assign',
      data
    );
    return response.data.data;
  },
};

