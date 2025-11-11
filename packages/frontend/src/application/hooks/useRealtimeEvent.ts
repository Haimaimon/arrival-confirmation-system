/**
 * Application Layer - useRealtimeEvent Hook
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketClient } from '../../infrastructure/websocket/socketClient';
import { useAuthStore } from '../stores/authStore';

export function useRealtimeEvent(eventId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!eventId || !accessToken) return;

    // Connect to WebSocket
    if (!socketClient.isConnected()) {
      socketClient.connect(accessToken);
    }

    // Join event room
    socketClient.joinEvent(eventId);

    // Listen for guest confirmed
    const handleGuestConfirmed = (data: any) => {
      console.log('Guest confirmed:', data);
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId }] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    };

    // Listen for guest declined
    const handleGuestDeclined = (data: any) => {
      console.log('Guest declined:', data);
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId }] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    };

    // Listen for stats update
    const handleStatsUpdate = (data: any) => {
      console.log('Stats updated:', data);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    };

    // Listen for notification sent
    const handleNotificationSent = (data: any) => {
      console.log('Notification sent:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications', { eventId }] });
    };

    // Listen for table updated
    const handleTableUpdated = (data: any) => {
      console.log('Table updated:', data);
      queryClient.invalidateQueries({ queryKey: ['tables', { eventId }] });
    };

    // Register handlers
    socketClient.on('guest:confirmed', handleGuestConfirmed);
    socketClient.on('guest:declined', handleGuestDeclined);
    socketClient.on('stats:update', handleStatsUpdate);
    socketClient.on('notification:sent', handleNotificationSent);
    socketClient.on('table:updated', handleTableUpdated);

    // Cleanup
    return () => {
      socketClient.off('guest:confirmed', handleGuestConfirmed);
      socketClient.off('guest:declined', handleGuestDeclined);
      socketClient.off('stats:update', handleStatsUpdate);
      socketClient.off('notification:sent', handleNotificationSent);
      socketClient.off('table:updated', handleTableUpdated);
      socketClient.leaveEvent(eventId);
    };
  }, [eventId, accessToken, queryClient]);
}

