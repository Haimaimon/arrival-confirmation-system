/**
 * Application Layer - Table Hooks
 * React Query hooks for table management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableApi } from '../../infrastructure/api/tableApi';
import {
  Table,
  CreateTableDto,
  UpdateTableDto,
  AssignGuestDto,
} from '../../domain/entities/Table';
import toast from 'react-hot-toast';

/**
 * Get table statistics for an event
 */
export function useTableStats(eventId: string) {
  return useQuery({
    queryKey: ['tableStats', eventId],
    queryFn: () => tableApi.getTableStats(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get all tables for an event
 */
export function useTables(eventId: string) {
  return useQuery({
    queryKey: ['tables', eventId],
    queryFn: () => tableApi.getTables(eventId),
    enabled: !!eventId,
  });
}

/**
 * Create a new table
 */
export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation<Table, unknown, CreateTableDto>({
    mutationFn: (data: CreateTableDto) => tableApi.createTable(data),
    onSuccess: (_table: Table, variables: CreateTableDto) => {
      toast.success('שולחן נוצר בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['tableStats', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['tables', variables.eventId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה ביצירת שולחן');
    },
  });
}

/**
 * Update a table
 */
export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation<Table, unknown, { id: string; data: UpdateTableDto }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tableApi.updateTable(id, data),
    onSuccess: (updatedTable: Table) => {
      toast.success('שולחן עודכן בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['tableStats', updatedTable.eventId] });
      queryClient.invalidateQueries({ queryKey: ['tables', updatedTable.eventId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בעדכון שולחן');
    },
  });
}

/**
 * Delete a table
 */
export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; eventId: string }>({
    mutationFn: ({ id }: { id: string; eventId: string }) =>
      tableApi.deleteTable(id),
    onSuccess: (_data: void, variables: { id: string; eventId: string }) => {
      toast.success('שולחן נמחק בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['tableStats', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['tables', variables.eventId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה במחיקת שולחן');
    },
  });
}

/**
 * Assign guest to table
 */
export function useAssignGuestToTable() {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, AssignGuestDto & { eventId: string }>({
    mutationFn: (data: AssignGuestDto & { eventId: string }) =>
      tableApi.assignGuestToTable(data),
    onSuccess: (_data: any, variables: AssignGuestDto & { eventId: string }) => {
      toast.success('אורח שוייך לשולחן בהצלחה');
      // Invalidate only table stats - it includes everything we need
      queryClient.invalidateQueries({ queryKey: ['tableStats', variables.eventId] });
      // Invalidate guests query to update the assignment in guests list
      queryClient.invalidateQueries({ queryKey: ['guests', { eventId: variables.eventId }] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בשיוך אורח');
    },
  });
}
