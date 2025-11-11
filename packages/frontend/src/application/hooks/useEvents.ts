/**
 * Application Layer - Events React Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi, CreateEventRequest, UpdateEventRequest } from '../../infrastructure/api/eventApi';
import { Event } from '../../domain/entities/Event';

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Get all user events
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: eventApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get event by ID
  const useEvent = (id: string) => {
    return useQuery<Event>({
      queryKey: ['event', id],
      queryFn: () => eventApi.getById(id),
      enabled: !!id,
    });
  };

  // Get upcoming events
  const useUpcomingEvents = () => {
    return useQuery<Event[]>({
      queryKey: ['events', 'upcoming'],
      queryFn: eventApi.getUpcoming,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) => eventApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events,
    isLoading,
    error,
    refetch,
    useEvent,
    useUpcomingEvents,
    createEvent: createMutation.mutate,
    updateEvent: updateMutation.mutate,
    deleteEvent: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};

