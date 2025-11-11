/**
 * Infrastructure Layer - Guest API
 */

import { apiClient } from './apiClient';
import { Guest, GuestStatus } from '../../domain/entities/Guest';

export interface CreateGuestDto {
  eventId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  type: string;
  numberOfGuests: number;
  notes?: string;
}

export interface GuestFilters {
  eventId: string;
  status?: GuestStatus;
  search?: string;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; error: string }>;
  guests: Guest[];
}

export const guestApi = {
  async getGuests(filters: GuestFilters): Promise<Guest[]> {
    const response = await apiClient.get<{ success: boolean; data: Guest[] }>(
      `/guests/event/${filters.eventId}`,
      { status: filters.status, search: filters.search }
    );
    return response.data.data;
  },

  async getGuestById(id: string): Promise<Guest> {
    const response = await apiClient.get<{ success: boolean; data: Guest }>(
      `/guests/${id}`
    );
    return response.data.data;
  },

  async createGuest(data: CreateGuestDto): Promise<Guest> {
    const response = await apiClient.post<{ success: boolean; data: Guest }>(
      '/guests',
      data
    );
    return response.data.data;
  },

  async confirmGuest(id: string, numberOfGuests?: number): Promise<Guest> {
    const response = await apiClient.patch<{ success: boolean; data: Guest }>(
      `/guests/${id}/confirm`,
      { numberOfGuests }
    );
    return response.data.data;
  },

  async importFromExcel(eventId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; data: ImportResult }>(
      `/guests/event/${eventId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async updateGuest(id: string, data: Partial<Guest>): Promise<Guest> {
    const response = await apiClient.put<{ success: boolean; data: Guest }>(
      `/guests/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteGuest(id: string): Promise<{ eventId: string }> {
    const response = await apiClient.delete<{ success: boolean; data: { eventId: string } }>(
      `/guests/${id}`
    );
    return response.data.data;
  },
};

