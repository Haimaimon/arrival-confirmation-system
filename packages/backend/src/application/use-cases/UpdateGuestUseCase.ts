/**
 * Application Layer - Update Guest Use Case
 * Handles business logic for updating an existing guest
 */

import { Guest } from '../../domain/entities/Guest';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../domain/repositories/IEventRepository';

export interface UpdateGuestDto {
  guestId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  type?: string;
  numberOfGuests?: number;
  notes?: string;
}

export class UpdateGuestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(dto: UpdateGuestDto): Promise<Guest> {
    // Get existing guest
    const existingGuest = await this.guestRepository.findById(dto.guestId);
    if (!existingGuest) {
      throw new Error('Guest not found');
    }

    // Verify event exists
    const event = await this.eventRepository.findById(existingGuest.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate phone if provided
    if (dto.phone && dto.phone.trim() !== '') {
      const phoneRegex = /^0\d{1,2}-?\d{7}$/;
      if (!phoneRegex.test(dto.phone.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }
    }

    // Validate email if provided
    if (dto.email && dto.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new Error('Invalid email format');
      }
    }

    // Validate numberOfGuests if provided
    if (dto.numberOfGuests !== undefined && dto.numberOfGuests < 1) {
      throw new Error('Number of guests must be at least 1');
    }

    // Build update data - only include defined fields
    const updateData: any = {};
    
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName.trim();
    }
    if (dto.phone !== undefined) {
      // Phone is optional - if empty string, save as null
      updateData.phone = dto.phone.trim() || null;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email.trim() || undefined;
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }
    if (dto.numberOfGuests !== undefined) {
      updateData.numberOfGuests = dto.numberOfGuests;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes.trim() || undefined;
    }

    // Update guest
    const updatedGuest = await this.guestRepository.update(dto.guestId, updateData);

    return updatedGuest;
  }
}

