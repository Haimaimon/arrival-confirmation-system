/**
 * Application Layer - Confirm Guest Attendance Use Case
 * Handles guest RSVP confirmation from public invitation link
 */

import { GuestStatus } from '../../../domain/entities/Guest';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { IGuestTokenService } from '../../../domain/services/IGuestTokenService';

export enum AttendanceResponse {
  ATTENDING = 'ATTENDING',        // מגיע
  NOT_ATTENDING = 'NOT_ATTENDING', // לא מגיע
  MAYBE = 'MAYBE',                 // מתלבט
}

export interface ConfirmGuestAttendanceDto {
  token: string;
  response: AttendanceResponse;
  numberOfGuests?: number; // כמה מתכננים להגיע
  notes?: string;          // הערות מהאורח
}

export interface ConfirmationResult {
  success: boolean;
  message: string;
  guestName: string;
  eventName: string;
}

export class ConfirmGuestAttendanceUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private tokenService: IGuestTokenService
  ) {}

  async execute(dto: ConfirmGuestAttendanceDto): Promise<ConfirmationResult> {
    // Verify token
    const tokenData = this.tokenService.verifyGuestToken(dto.token);
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

    // Map response to guest status
    let newStatus: GuestStatus;
    switch (dto.response) {
      case AttendanceResponse.ATTENDING:
        newStatus = GuestStatus.CONFIRMED;
        break;
      case AttendanceResponse.NOT_ATTENDING:
        newStatus = GuestStatus.DECLINED;
        break;
      case AttendanceResponse.MAYBE:
        newStatus = GuestStatus.PENDING; // או נוכל להוסיף MAYBE status
        break;
      default:
        throw new Error('Invalid response');
    }

    // Update guest data
    const updateData: any = {
      status: newStatus,
      confirmedAt: dto.response === AttendanceResponse.ATTENDING ? new Date() : undefined,
    };

    // Update number of guests if provided and attending
    if (dto.numberOfGuests !== undefined && dto.response === AttendanceResponse.ATTENDING) {
      if (dto.numberOfGuests < 0) {
        throw new Error('Number of guests must be positive');
      }
      updateData.numberOfGuests = dto.numberOfGuests;
    }

    // Update notes if provided
    if (dto.notes && dto.notes.trim()) {
      const existingNotes = guest.notes || '';
      const guestNote = `[אורח: ${dto.notes.trim()}]`;
      updateData.notes = existingNotes 
        ? `${existingNotes}\n${guestNote}` 
        : guestNote;
    }

    // Save updated guest
    await this.guestRepository.update(guestId, updateData);

    // Update event statistics
    const confirmedCount = await this.guestRepository.countByStatus(eventId, GuestStatus.CONFIRMED);
    const declinedCount = await this.guestRepository.countByStatus(eventId, GuestStatus.DECLINED);
    const pendingCount = await this.guestRepository.countByStatus(eventId, GuestStatus.PENDING);
    
    event.updateGuestCounts(
      confirmedCount,
      declinedCount,
      pendingCount
    );
    await this.eventRepository.update(event);

    // Return confirmation message
    const messages = {
      [AttendanceResponse.ATTENDING]: `תודה ${guest.fullName}! נשמח לראותכם 🎉`,
      [AttendanceResponse.NOT_ATTENDING]: `תודה על העדכון ${guest.fullName}. נצטער שלא תוכלו להגיע 💐`,
      [AttendanceResponse.MAYBE]: `תודה ${guest.fullName}! נשמח לדעת כשתחליטו 💫`,
    };

    return {
      success: true,
      message: messages[dto.response],
      guestName: guest.fullName,
      eventName: event.name || `חתונת ${event.type}`,
    };
  }
}

