/**
 * Presentation Layer - Event Routes
 */

import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateMiddleware } from '../middlewares/validationMiddleware';
import { z } from 'zod';

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  type: z.enum(['WEDDING', 'BAR_MITZVAH', 'BAT_MITZVAH', 'BIRTHDAY', 'CORPORATE', 'OTHER']),
  eventDate: z.string().datetime(),
  venue: z.object({
    name: z.string().min(1, 'Venue name is required'),
    address: z.string().min(1, 'Venue address is required'),
    city: z.string().min(1, 'City is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googleMapsUrl: z.string().url().optional(),
  }),
  settings: z
    .object({
      enableSms: z.boolean().optional(),
      enableWhatsApp: z.boolean().optional(),
      enablePhoneCalls: z.boolean().optional(),
      enableMorningReminder: z.boolean().optional(),
      enableEveningReminder: z.boolean().optional(),
      enableThankYouMessage: z.boolean().optional(),
      enableGiftRegistry: z.boolean().optional(),
      giftRegistryUrl: z.string().url().optional(),
      customInvitationDesign: z.string().optional(),
      seatsPerTable: z.number().min(1).optional(),
      maxTables: z.number().min(1).optional(),
    })
    .optional(),
});

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['WEDDING', 'BAR_MITZVAH', 'BAT_MITZVAH', 'BIRTHDAY', 'CORPORATE', 'OTHER']).optional(),
  eventDate: z.string().datetime().optional(),
  venue: z
    .object({
      name: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      googleMapsUrl: z.string().url().optional(),
    })
    .optional(),
  settings: z
    .object({
      enableSms: z.boolean().optional(),
      enableWhatsApp: z.boolean().optional(),
      enablePhoneCalls: z.boolean().optional(),
      enableMorningReminder: z.boolean().optional(),
      enableEveningReminder: z.boolean().optional(),
      enableThankYouMessage: z.boolean().optional(),
      enableGiftRegistry: z.boolean().optional(),
      giftRegistryUrl: z.string().url().optional(),
      customInvitationDesign: z.string().optional(),
      seatsPerTable: z.number().min(1).optional(),
      maxTables: z.number().min(1).optional(),
    })
    .optional(),
});

export function createEventRoutes(controller: EventController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Create new event
  router.post('/', validateMiddleware(createEventSchema), controller.createEvent);

  // Get all user events
  router.get('/', controller.getEvents);

  // Get upcoming events
  router.get('/upcoming', controller.getUpcomingEvents);

  // Get event by ID
  router.get('/:id', controller.getEventById);

  // Update event
  router.put('/:id', validateMiddleware(updateEventSchema), controller.updateEvent);

  // Delete event
  router.delete('/:id', controller.deleteEvent);

  return router;
}

