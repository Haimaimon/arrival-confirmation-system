/**
 * Application Layer - Import Guests from Excel Use Case
 */

import * as XLSX from 'xlsx';
import { Guest, GuestProps, GuestStatus } from '../../../domain/entities/Guest';
import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { v4 as uuidv4 } from 'uuid';

export interface ExcelGuestRow {
  fullName: string; // הזמנה לכבוד (REQUIRED!)
  numberOfGuests?: number; // מס׳ אורחים שהוזמנו
  side?: string; // צד
  group?: string; // קבוצה
  phone?: string; // טלפון רגיל
  email?: string; // אימייל
  city?: string; // עיר
  street?: string; // רחוב
  address?: string; // כתובת
  postalCode?: string; // מיקוד
  poBox?: string; // תא דואר
  notes?: string; // הערות
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; error: string }>;
  guests: Guest[];
}

export class ImportGuestsFromExcelUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(eventId: string, fileBuffer: Buffer): Promise<ImportResult> {
    // Validate event
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

    const result: ImportResult = {
      successCount: 0,
      failureCount: 0,
      errors: [],
      guests: [],
    };

    const guestsToSave: Guest[] = [];

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = this.normalizeRow(rawData[i]);
        const guest = this.createGuestFromRow(eventId, row);
        guestsToSave.push(guest);
      } catch (error: any) {
        result.failureCount++;
        result.errors.push({
          row: i + 2, // +2 because Excel rows start at 1 and row 1 is header
          error: error.message,
        });
      }
    }

    // Check capacity
    const totalGuestsToAdd = guestsToSave.reduce(
      (sum, g) => sum + g.numberOfGuests,
      0
    );

    if (!event.canAddGuests(totalGuestsToAdd)) {
      throw new Error(
        `Event capacity exceeded. Available: ${event.availableSeats - event.totalInvited}, Requested: ${totalGuestsToAdd}`
      );
    }

    // Bulk save
    if (guestsToSave.length > 0) {
      const savedGuests = await this.guestRepository.bulkSave(guestsToSave);
      result.guests = savedGuests;
      result.successCount = savedGuests.length;

      // Update event statistics
      const currentPending = event.totalPending;
      event.updateGuestCounts(
        event.totalConfirmed,
        event.totalDeclined,
        currentPending + savedGuests.length
      );
      await this.eventRepository.update(event);
    }

    return result;
  }

  private normalizeRow(row: any): ExcelGuestRow {
    // הזמנה לכבוד - REQUIRED!
    const fullName = this.normalizeString(
      row['הזמנה לכבוד'] || 
      row['fullName'] || 
      row['שם'] ||
      row['name'] ||
      ''
    );
    
    if (!fullName) {
      throw new Error('שדה "הזמנה לכבוד" הוא חובה');
    }
    
    // Build address from multiple fields
    const addressParts = [];
    const street = this.normalizeString(row['רחוב'] || row['street']);
    const city = this.normalizeString(row['עיר'] || row['city']);
    const address = this.normalizeString(row['כתובת'] || row['address']);
    
    if (address) addressParts.push(address);
    if (street) addressParts.push(street);
    if (city) addressParts.push(city);
    
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;
    
    return {
      fullName,
      numberOfGuests: this.normalizeNumberOptional(
        row['מס\' אורחים שהוזמנו'] || 
        row['מספר אורחים'] || 
        row['numberOfGuests']
      ),
      side: this.normalizeString(row['צד'] || row['side']),
      group: this.normalizeString(row['קבוצה'] || row['group']),
      phone: this.normalizeString(row['טלפון רגיל'] || row['טלפון'] || row['phone']),
      email: this.normalizeString(row['אימייל'] || row['email']),
      city: this.normalizeString(row['עיר'] || row['city']),
      street: this.normalizeString(row['רחוב'] || row['street']),
      address: fullAddress,
      postalCode: this.normalizeString(row['מיקוד'] || row['postalCode']),
      poBox: this.normalizeString(row['תא דואר'] || row['poBox']),
      notes: this.normalizeString(
        row['הערות'] || 
        row['notes'] ||
        row['צ\'ק צפוי'] // Include expected check in notes
      ),
    };
  }

  private normalizeString(value: any): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    return String(value).trim();
  }

  private normalizeNumberOptional(value: any): number {
    if (value === undefined || value === null || value === '') return 1;
    const num = Number(value);
    if (isNaN(num) || num < 1) return 1;
    return Math.floor(num);
  }
  
  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    
    // Take the first part as first name, rest as last name
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    
    return { firstName, lastName };
  }

  private createGuestFromRow(eventId: string, row: ExcelGuestRow): Guest {
    // Split full name to first and last name
    const { firstName, lastName } = this.splitFullName(row.fullName);
    
    // Parse side (צד) to type (GROOM/BRIDE/MUTUAL)
    const guestType = this.parseGuestSide(row.side);
    
    // Build notes from multiple optional fields
    const notesParts = [];
    if (row.group) notesParts.push(`קבוצה: ${row.group}`);
    if (row.address) notesParts.push(`כתובת: ${row.address}`);
    if (row.postalCode) notesParts.push(`מיקוד: ${row.postalCode}`);
    if (row.poBox) notesParts.push(`ת.ד: ${row.poBox}`);
    if (row.notes) notesParts.push(row.notes);
    
    const notes = notesParts.length > 0 ? notesParts.join(' | ') : undefined;
    
    const guestProps: GuestProps = {
      id: uuidv4(),
      eventId,
      firstName,
      lastName: lastName || firstName, // If no last name, use first name
      phone: row.phone, // Phone is optional
      email: row.email,
      type: guestType,
      status: GuestStatus.PENDING,
      numberOfGuests: row.numberOfGuests || 1,
      notes,
      smsCount: 0,
      whatsappCount: 0,
      phoneCallCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Guest(guestProps);
  }

  private parseGuestSide(side?: string): string {
    if (!side) return 'MUTUAL';
    
    const normalized = side.trim();
    
    // Check if it's חתן (Groom)
    if (normalized === 'חתן' || normalized.toLowerCase() === 'groom') {
      return 'GROOM';
    }
    
    // Check if it's כלה (Bride)
    if (normalized === 'כלה' || normalized.toLowerCase() === 'bride') {
      return 'BRIDE';
    }
    
    // Check if it's משותף (Mutual)
    if (normalized === 'משותף' || normalized.toLowerCase() === 'mutual') {
      return 'MUTUAL';
    }
    
    // Default to the value as-is (allows custom types)
    return normalized;
  }
}

