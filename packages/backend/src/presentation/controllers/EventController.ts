/**
 * Presentation Layer - Event Controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateEventUseCase } from '../../application/use-cases/event/CreateEventUseCase';
import { UpdateEventUseCase } from '../../application/use-cases/event/UpdateEventUseCase';
import { DeleteEventUseCase } from '../../application/use-cases/event/DeleteEventUseCase';
import {
  GetEventByIdUseCase,
  GetUserEventsUseCase,
  GetUpcomingEventsUseCase,
} from '../../application/use-cases/event/GetEventUseCase';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { ICacheService } from '../../domain/services/ICacheService';

export class EventController {
  private createEventUseCase: CreateEventUseCase;
  private updateEventUseCase: UpdateEventUseCase;
  private deleteEventUseCase: DeleteEventUseCase;
  private getEventByIdUseCase: GetEventByIdUseCase;
  private getUserEventsUseCase: GetUserEventsUseCase;
  private getUpcomingEventsUseCase: GetUpcomingEventsUseCase;

  constructor(
    eventRepository: IEventRepository,
    guestRepository: IGuestRepository,
    private cacheService: ICacheService
  ) {
    this.createEventUseCase = new CreateEventUseCase(eventRepository);
    this.updateEventUseCase = new UpdateEventUseCase(eventRepository);
    this.deleteEventUseCase = new DeleteEventUseCase(eventRepository, guestRepository);
    this.getEventByIdUseCase = new GetEventByIdUseCase(eventRepository);
    this.getUserEventsUseCase = new GetUserEventsUseCase(eventRepository);
    this.getUpcomingEventsUseCase = new GetUpcomingEventsUseCase(eventRepository);
  }

  createEvent = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { name, type, eventDate, venue, settings } = req.body;

      const event = await this.createEventUseCase.execute({
        userId: req.user.userId,
        name,
        type,
        eventDate: new Date(eventDate),
        venue,
        settings,
      });

      // Clear user events cache
      await this.cacheService.delete(`events:user:${req.user.userId}`);

      return res.status(201).json({
        success: true,
        data: event.toObject(),
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  getEvents = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const cacheKey = `events:user:${req.user.userId}`;
      const cached = await this.cacheService.get(cacheKey);

      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
        });
      }

      const events = await this.getUserEventsUseCase.execute(req.user.userId);
      const eventsData = events.map((e) => e.toObject());

      await this.cacheService.set(cacheKey, eventsData, 300); // 5 minutes

      return res.json({
        success: true,
        data: eventsData,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getEventById = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const event = await this.getEventByIdUseCase.execute(id, req.user.userId);

      return res.json({
        success: true,
        data: event.toObject(),
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 403;
      return res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  };

  updateEvent = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const { name, type, eventDate, venue, settings } = req.body;

      // Verify ownership first
      await this.getEventByIdUseCase.execute(id, req.user.userId);

      const event = await this.updateEventUseCase.execute({
        eventId: id,
        name,
        type,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        venue,
        settings,
      });

      // Clear caches
      await this.cacheService.delete(`events:user:${req.user.userId}`);
      await this.cacheService.delete(`event:${id}`);

      return res.json({
        success: true,
        data: event.toObject(),
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      return res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  };

  deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      await this.deleteEventUseCase.execute(id, req.user.userId);

      // Clear caches
      await this.cacheService.delete(`events:user:${req.user.userId}`);
      await this.cacheService.delete(`event:${id}`);

      return res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 403;
      return res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  };

  getUpcomingEvents = async (_req: AuthRequest, res: Response) => {
    try {
      const cacheKey = 'events:upcoming';
      const cached = await this.cacheService.get(cacheKey);

      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
        });
      }

      const events = await this.getUpcomingEventsUseCase.execute();
      const eventsData = events.map((e) => e.toObject());

      await this.cacheService.set(cacheKey, eventsData, 300); // 5 minutes

      return res.json({
        success: true,
        data: eventsData,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

