/**
 * Infrastructure Layer - Invitation API Client
 * API calls for guest invitation confirmation (public endpoints)
 */

import { apiClient } from './apiClient';

export interface InvitationDetails {
  guest: {
    id: string;
    fullName: string;
    numberOfGuests: number;
    currentStatus: string;
  };
  event: {
    id: string;
    name: string;
    type: string;
    eventDate: string;
    venue?: string;
    address?: string;
  };
  hasResponded: boolean;
}

export interface ConfirmAttendanceData {
  response: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
  numberOfGuests?: number;
  notes?: string;
}

export interface ConfirmationResult {
  success: boolean;
  message: string;
  guestName: string;
  eventName: string;
}

export const invitationApi = {
  /**
   * Get invitation details by token (Public)
   */
  async getInvitationDetails(token: string): Promise<InvitationDetails> {
    const response = await apiClient.get<{ success: boolean; data: InvitationDetails }>(
      `/invitations/${token}`
    );
    return response.data.data;
  },

  /**
   * Confirm guest attendance (Public)
   */
  async confirmAttendance(
    token: string,
    data: ConfirmAttendanceData
  ): Promise<ConfirmationResult> {
    const response = await apiClient.post<{ success: boolean; data: ConfirmationResult }>(
      `/invitations/${token}/confirm`,
      data
    );
    return response.data.data;
  },

  /**
   * Generate invitation link for a guest (Admin only)
   */
  async generateInvitationLink(guestId: string, eventId: string): Promise<{ invitationUrl: string; guestName: string }> {
    const response = await apiClient.post<{ success: boolean; data: { invitationUrl: string; guestName: string } }>(
      `/invitations/generate`,
      { guestId, eventId }
    );
    return response.data.data;
  },

  /**
   * Send invitation via WhatsApp (Admin only)
   */
  async sendInvitationWhatsApp(
    guestId: string,
    eventId: string,
    customMessage?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; data: { success: boolean; message: string } }>(
      `/invitations/send-whatsapp`,
      { guestId, eventId, customMessage }
    );
    return response.data.data;
  },
};

