/**
 * Application Layer - useGuests Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestApi, GuestFilters, CreateGuestDto, ImportResult } from '../../infrastructure/api/guestApi';
import { Guest } from '../../domain/entities/Guest';
import toast from 'react-hot-toast';

export function useGuests(filters: GuestFilters) {
  return useQuery({
    queryKey: ['guests', filters],
    queryFn: () => guestApi.getGuests(filters),
  });
}

export function useGuest(id: string) {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: () => guestApi.getGuestById(id),
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, unknown, CreateGuestDto>({
    mutationFn: (data: CreateGuestDto) => guestApi.createGuest(data),
    onSuccess: (_result: Guest, variables: CreateGuestDto) => {
      toast.success('אורח נוסף בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId: variables.eventId }] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: () => {
      toast.error('שגיאה בהוספת אורח');
    },
  });
}

export function useConfirmGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, unknown, { id: string; numberOfGuests?: number }>({
    mutationFn: ({ id, numberOfGuests }: { id: string; numberOfGuests?: number }) =>
      guestApi.confirmGuest(id, numberOfGuests),
    onSuccess: (data: Guest) => {
      toast.success('אישור הגעה נשמר בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', data.id] });
    },
    onError: () => {
      toast.error('שגיאה באישור הגעה');
    },
  });
}

export function useImportGuests() {
  const queryClient = useQueryClient();

  return useMutation<ImportResult, unknown, { eventId: string; file: File }>({
    mutationFn: ({ eventId, file }: { eventId: string; file: File }) =>
      guestApi.importFromExcel(eventId, file),
    onSuccess: (result: ImportResult, variables: { eventId: string; file: File }) => {
      console.log('✅ Import successful:', result);
      toast.success(`יובאו ${result.successCount} אורחים בהצלחה`);
      if (result.failureCount > 0) {
        toast.error(`${result.failureCount} אורחים נכשלו בייבוא`);
      }
      // Invalidate ALL guest queries for this event to force refresh
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId: variables.eventId }] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      // Also invalidate event queries to update totals
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('❌ Import error:', error);
      toast.error('שגיאה בייבוא אורחים');
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, unknown, { id: string; data: Partial<Guest> }>({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guest> }) =>
      guestApi.updateGuest(id, data),
    onSuccess: (updatedGuest: Guest) => {
      toast.success('אורח עודכן בהצלחה');
      // Invalidate all guest queries for this specific event
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId: updatedGuest.eventId }] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: () => {
      toast.error('שגיאה בעדכון אורח');
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation<{ eventId: string }, unknown, string>({
    mutationFn: (id: string) => guestApi.deleteGuest(id),
    onSuccess: (data: { eventId: string }) => {
      toast.success('אורח נמחק בהצלחה');
      // Invalidate all guest queries for this specific event
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId: data.eventId }] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: () => {
      toast.error('שגיאה במחיקת אורח');
    },
  });
}

