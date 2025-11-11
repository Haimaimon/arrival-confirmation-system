/**
 * Application Layer - Get Event(s) Use Cases
 */

import { Event } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export class GetEventByIdUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify ownership
    if (event.userId !== userId) {
      throw new Error('Unauthorized: You can only access your own events');
    }

    return event;
  }
}

export class GetUserEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(userId: string): Promise<Event[]> {
    return await this.eventRepository.findByUserId(userId);
  }
}

export class GetUpcomingEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<Event[]> {
    return await this.eventRepository.findUpcoming();
  }
}

