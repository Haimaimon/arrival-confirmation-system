/**
 * Application Layer - Get Guest Invitation Details Use Case
 * Retrieves invitation details for guest confirmation page
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { IGuestTokenService } from '../../../domain/services/IGuestTokenService';

export interface InvitationDetails {
  guest: {
    id: string;
    fullName: string;
    numberOfGuests: number;
    currentStatus: string;
  };
  event: {
    id: string;
    name: string;
    type: string;
    eventDate: Date;
    venue?: string;
    address?: string;
  };
  hasResponded: boolean;
}

export class GetGuestInvitationDetailsUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private tokenService: IGuestTokenService
  ) {}

  async execute(token: string): Promise<InvitationDetails> {
    // Verify token
    const tokenData = this.tokenService.verifyGuestToken(token);
    if (!tokenData) {
      throw new Error('Invalid or expired invitation link');
    }

    const { guestId, eventId } = tokenData;

    // Get guest
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Get event
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if guest has already responded
    const hasResponded = guest.status !== 'PENDING';

    return {
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        numberOfGuests: guest.numberOfGuests,
        currentStatus: guest.status,
      },
      event: {
        id: event.id,
        name: event.name || `חתונת ${event.type}`,
        type: event.type,
        eventDate: event.eventDate,
        venue: event.venue.name,
        address: event.venue.address,
      },
      hasResponded,
    };
  }
}

