/**
 * Application Layer - Update Event Use Case
 */

import { Event, EventType, VenueInfo, EventSettings } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export interface UpdateEventDTO {
  eventId: string;
  name?: string;
  type?: EventType;
  eventDate?: Date;
  venue?: VenueInfo;
  settings?: Partial<EventSettings>;
}

export class UpdateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(dto: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepository.findById(dto.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Create updated props
    const updatedProps = {
      ...event.toObject(),
      name: dto.name ?? event.name,
      type: dto.type ?? event.type,
      eventDate: dto.eventDate ?? event.eventDate,
      venue: dto.venue ?? event.venue,
      settings: dto.settings ? { ...event.settings, ...dto.settings } : event.settings,
      updatedAt: new Date(),
    };

    const updatedEvent = new Event(updatedProps);
    return await this.eventRepository.update(updatedEvent);
  }
}

