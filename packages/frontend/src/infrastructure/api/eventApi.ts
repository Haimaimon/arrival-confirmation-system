/**
 * Infrastructure Layer - Event API Client
 */

import { apiClient } from './apiClient';
import { Event, EventType } from '../../domain/entities/Event';

export interface CreateEventRequest {
  name: string;
  type: EventType;
  eventDate: string;
  venue: {
    name: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
  };
  settings?: {
    enableSms?: boolean;
    enableWhatsApp?: boolean;
    enablePhoneCalls?: boolean;
    enableMorningReminder?: boolean;
    enableEveningReminder?: boolean;
    enableThankYouMessage?: boolean;
    enableGiftRegistry?: boolean;
    giftRegistryUrl?: string;
    customInvitationDesign?: string;
    seatsPerTable?: number;
    maxTables?: number;
  };
}

export interface UpdateEventRequest {
  name?: string;
  type?: EventType;
  eventDate?: string;
  venue?: {
    name: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
  };
  settings?: {
    enableSms?: boolean;
    enableWhatsApp?: boolean;
    enablePhoneCalls?: boolean;
    enableMorningReminder?: boolean;
    enableEveningReminder?: boolean;
    enableThankYouMessage?: boolean;
    enableGiftRegistry?: boolean;
    giftRegistryUrl?: string;
    customInvitationDesign?: string;
    seatsPerTable?: number;
    maxTables?: number;
  };
}

export const eventApi = {
  // Get all user events
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get<{ success: boolean; data: Event[] }>('/events');
    return response.data.data;
  },

  // Get event by ID
  getById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<{ success: boolean; data: Event }>(`/events/${id}`);
    return response.data.data;
  },

  // Get upcoming events
  getUpcoming: async (): Promise<Event[]> => {
    const response = await apiClient.get<{ success: boolean; data: Event[] }>('/events/upcoming');
    return response.data.data;
  },

  // Create new event
  create: async (data: CreateEventRequest): Promise<Event> => {
    const response = await apiClient.post<{ success: boolean; data: Event }>('/events', data);
    return response.data.data;
  },

  // Update event
  update: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    const response = await apiClient.put<{ success: boolean; data: Event }>(`/events/${id}`, data);
    return response.data.data;
  },

  // Delete event
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};

