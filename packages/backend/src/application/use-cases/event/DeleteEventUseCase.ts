/**
 * Application Layer - Delete Event Use Case
 */

import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';

export class DeleteEventUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private guestRepository: IGuestRepository
  ) {}

  async execute(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify ownership
    if (event.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own events');
    }

    // Delete all guests associated with this event
    const guests = await this.guestRepository.findByEventId(eventId);
    for (const guest of guests) {
      await this.guestRepository.delete(guest.id);
    }

    // Delete the event
    await this.eventRepository.delete(eventId);
  }
}

