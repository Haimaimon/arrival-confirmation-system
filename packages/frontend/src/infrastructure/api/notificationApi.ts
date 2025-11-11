/**
 * Infrastructure Layer - Notification API Client
 */

import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  eventId: string;
  guestId: string;
  type: 'SMS' | 'WHATSAPP' | 'VOICE';
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
  message: string;
  phoneNumber: string;
  twilioMessageId?: string;
  error?: string;
  sentAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendNotificationDto {
  type: 'SMS' | 'WHATSAPP' | 'VOICE';
  message?: string;
}

export const notificationApi = {
  async sendNotification(guestId: string, data: SendNotificationDto): Promise<Notification> {
    const response = await apiClient.post<{ success: boolean; data: Notification }>(
      `/notifications/guest/${guestId}`,
      data
    );
    return response.data.data;
  },

  async getGuestNotifications(guestId: string): Promise<Notification[]> {
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
      `/notifications/guest/${guestId}`
    );
    return response.data.data;
  },

  async getEventNotifications(eventId: string): Promise<Notification[]> {
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
      `/notifications/event/${eventId}`
    );
    return response.data.data;
  },
};

