/**
 * Application Layer - Create Event Use Case
 */

import { v4 as uuidv4 } from 'uuid';
import { Event, EventType, EventStatus, VenueInfo, EventSettings, EventProps } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export interface CreateEventDTO {
  userId: string;
  name: string;
  type: EventType;
  eventDate: Date;
  venue: VenueInfo;
  settings?: Partial<EventSettings>;
}

export class CreateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(dto: CreateEventDTO): Promise<Event> {
    // Default settings
    const defaultSettings: EventSettings = {
      enableSms: true,
      enableWhatsApp: true,
      enablePhoneCalls: true,
      enableMorningReminder: true,
      enableEveningReminder: true,
      enableThankYouMessage: true,
      enableGiftRegistry: false,
      seatsPerTable: 10,
      maxTables: 50,
      ...dto.settings,
    };

    const eventProps: EventProps = {
      id: uuidv4(),
      userId: dto.userId,
      name: dto.name,
      type: dto.type,
      status: EventStatus.DRAFT,
      eventDate: dto.eventDate,
      venue: dto.venue,
      settings: defaultSettings,
      totalInvited: 0,
      totalConfirmed: 0,
      totalDeclined: 0,
      totalPending: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event = new Event(eventProps);
    return await this.eventRepository.save(event);
  }
}

