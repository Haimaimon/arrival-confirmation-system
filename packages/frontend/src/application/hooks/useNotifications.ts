/**
 * Application Layer - Notification Hooks
 * React Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, SendNotificationDto } from '../../infrastructure/api/notificationApi';
import toast from 'react-hot-toast';

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, data }: { guestId: string; data: SendNotificationDto }) =>
      notificationApi.sendNotification(guestId, data),
    onSuccess: (notification, variables) => {
      const typeLabels = {
        SMS: 'SMS',
        WHATSAPP: 'WhatsApp',
        VOICE: 'שיחה קולית',
      };
      toast.success(`${typeLabels[variables.data.type]} נשלח בהצלחה!`);
      
      // Invalidate guest queries to update counters
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', { guestId: variables.guestId }] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בשליחת ההודעה');
    },
  });
}

export function useGuestNotifications(guestId: string) {
  return useQuery({
    queryKey: ['notifications', { guestId }],
    queryFn: () => notificationApi.getGuestNotifications(guestId),
    enabled: !!guestId,
  });
}

export function useEventNotifications(eventId: string) {
  return useQuery({
    queryKey: ['notifications', { eventId }],
    queryFn: () => notificationApi.getEventNotifications(eventId),
    enabled: !!eventId,
  });
}

