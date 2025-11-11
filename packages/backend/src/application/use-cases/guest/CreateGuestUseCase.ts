/**
 * Application Layer - Create Guest Use Case
 * Implements business logic for creating a guest
 */

import { Guest, GuestProps, GuestStatus, GuestType } from '../../../domain/entities/Guest';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateGuestDTO {
  eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  type: GuestType;
  numberOfGuests: number;
  notes?: string;
}

export class CreateGuestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(dto: CreateGuestDTO): Promise<Guest> {
    // Validate event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event can accept more guests
    if (!event.canAddGuests(dto.numberOfGuests)) {
      throw new Error('Event capacity exceeded');
    }

    // Create guest entity
    const guestProps: GuestProps = {
      id: uuidv4(),
      eventId: dto.eventId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
      type: dto.type,
      status: GuestStatus.PENDING,
      numberOfGuests: dto.numberOfGuests,
      notes: dto.notes,
      smsCount: 0,
      whatsappCount: 0,
      phoneCallCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const guest = new Guest(guestProps);

    // Save to repository
    const savedGuest = await this.guestRepository.save(guest);

    // Update event statistics
    const currentPending = event.totalPending;
    event.updateGuestCounts(
      event.totalConfirmed,
      event.totalDeclined,
      currentPending + 1
    );
    await this.eventRepository.update(event);

    return savedGuest;
  }
}

