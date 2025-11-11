/**
 * Application Layer - Invitation Hooks
 * React Query hooks for invitation management
 */

import { useMutation } from '@tanstack/react-query';
import { invitationApi } from '../../infrastructure/api/invitationApi';
import { toast } from 'react-hot-toast';

/**
 * Hook for sending invitation via WhatsApp
 */
export const useSendInvitationWhatsApp = () => {
  return useMutation({
    mutationFn: async ({
      guestId,
      eventId,
      customMessage,
    }: {
      guestId: string;
      eventId: string;
      customMessage?: string;
    }) => {
      return invitationApi.sendInvitationWhatsApp(guestId, eventId, customMessage);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'הזמנה נשלחה בהצלחה ב-WhatsApp! 📱✨', {
        duration: 4000,
        icon: '📱',
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'שגיאה בשליחת הזמנה ב-WhatsApp';
      toast.error(errorMessage, {
        duration: 5000,
      });
      console.error('Error sending WhatsApp invitation:', error);
    },
  });
};

