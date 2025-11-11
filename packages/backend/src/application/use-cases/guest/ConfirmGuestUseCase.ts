/**
 * Application Layer - Confirm Guest Use Case
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Guest } from '../../../domain/entities/Guest';
import { ICacheService } from '../../../domain/services/ICacheService';

export interface ConfirmGuestDTO {
  guestId: string;
  numberOfGuests?: number;
}

export class ConfirmGuestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private cacheService: ICacheService
  ) {}

  async execute(dto: ConfirmGuestDTO): Promise<Guest> {
    // Find guest
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Build update data
    const updateData: any = {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    };

    // Update number of guests if provided
    if (dto.numberOfGuests && dto.numberOfGuests !== guest.numberOfGuests) {
      updateData.numberOfGuests = dto.numberOfGuests;
    }

    // Save guest
    const updatedGuest = await this.guestRepository.update(guest.id, updateData);

    // Update event statistics
    const event = await this.eventRepository.findById(guest.eventId);
    if (event) {
      event.incrementConfirmed();
      await this.eventRepository.update(event);
      
      // Invalidate cache
      await this.cacheService.delete(`event:${event.id}`);
      await this.cacheService.delete(`event:${event.id}:stats`);
    }

    return updatedGuest;
  }
}

