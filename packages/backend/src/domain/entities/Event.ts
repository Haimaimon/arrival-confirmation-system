/**
 * Domain Layer - Event Entity
 * Core business entity for events
 */

export enum EventType {
  WEDDING = 'WEDDING',
  BAR_MITZVAH = 'BAR_MITZVAH',
  BAT_MITZVAH = 'BAT_MITZVAH',
  BIRTHDAY = 'BIRTHDAY',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface VenueInfo {
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
}

export interface EventSettings {
  enableSms: boolean;
  enableWhatsApp: boolean;
  enablePhoneCalls: boolean;
  enableMorningReminder: boolean;
  enableEveningReminder: boolean;
  enableThankYouMessage: boolean;
  enableGiftRegistry: boolean;
  giftRegistryUrl?: string;
  customInvitationDesign?: string;
  seatsPerTable: number;
  maxTables: number;
}

export interface EventProps {
  id: string;
  userId: string;
  name: string;
  type: EventType;
  status: EventStatus;
  eventDate: Date;
  venue: VenueInfo;
  settings: EventSettings;
  totalInvited: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Event {
  private props: EventProps;

  constructor(props: EventProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  private validateProps(props: EventProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Event name is required');
    }
    if (props.eventDate < new Date()) {
      throw new Error('Event date must be in the future');
    }
    if (!props.venue.name || !props.venue.address) {
      throw new Error('Venue information is incomplete');
    }
    if (props.settings.seatsPerTable < 1) {
      throw new Error('Seats per table must be at least 1');
    }
    if (props.settings.maxTables < 1) {
      throw new Error('Max tables must be at least 1');
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): EventType {
    return this.props.type;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  get eventDate(): Date {
    return this.props.eventDate;
  }

  get venue(): VenueInfo {
    return { ...this.props.venue };
  }

  get settings(): EventSettings {
    return { ...this.props.settings };
  }

  get totalInvited(): number {
    return this.props.totalInvited;
  }

  get totalConfirmed(): number {
    return this.props.totalConfirmed;
  }

  get totalDeclined(): number {
    return this.props.totalDeclined;
  }

  get totalPending(): number {
    return this.props.totalPending;
  }

  get confirmationRate(): number {
    if (this.props.totalInvited === 0) return 0;
    return (this.props.totalConfirmed / this.props.totalInvited) * 100;
  }

  get responseRate(): number {
    if (this.props.totalInvited === 0) return 0;
    const responded = this.props.totalConfirmed + this.props.totalDeclined;
    return (responded / this.props.totalInvited) * 100;
  }

  get requiredSeats(): number {
    return this.props.totalConfirmed;
  }

  get requiredTables(): number {
    return Math.ceil(this.props.totalConfirmed / this.props.settings.seatsPerTable);
  }

  get availableSeats(): number {
    return this.props.settings.maxTables * this.props.settings.seatsPerTable;
  }

  get emptySeats(): number {
    const usedSeats = this.requiredSeats;
    const allocatedSeats = this.requiredTables * this.props.settings.seatsPerTable;
    return allocatedSeats - usedSeats;
  }

  // Business logic methods
  isEventInFuture(): boolean {
    return this.props.eventDate > new Date();
  }

  isEventToday(): boolean {
    const today = new Date();
    const eventDate = this.props.eventDate;
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }

  daysUntilEvent(): number {
    const today = new Date();
    const diffTime = this.props.eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canAddGuests(count: number): boolean {
    const potentialTotal = this.props.totalInvited + count;
    return potentialTotal <= this.availableSeats;
  }

  incrementConfirmed(): void {
    this.props.totalConfirmed++;
    this.props.totalPending = Math.max(0, this.props.totalPending - 1);
    this.props.updatedAt = new Date();
  }

  decrementConfirmed(): void {
    this.props.totalConfirmed = Math.max(0, this.props.totalConfirmed - 1);
    this.props.updatedAt = new Date();
  }

  incrementDeclined(): void {
    this.props.totalDeclined++;
    this.props.totalPending = Math.max(0, this.props.totalPending - 1);
    this.props.updatedAt = new Date();
  }

  updateGuestCounts(confirmed: number, declined: number, pending: number): void {
    this.props.totalConfirmed = confirmed;
    this.props.totalDeclined = declined;
    this.props.totalPending = pending;
    this.props.totalInvited = confirmed + declined + pending;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.status === EventStatus.ACTIVE) {
      throw new Error('Event is already active');
    }
    if (!this.isEventInFuture()) {
      throw new Error('Cannot activate past events');
    }
    this.props.status = EventStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  complete(): void {
    this.props.status = EventStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === EventStatus.COMPLETED) {
      throw new Error('Cannot cancel completed events');
    }
    this.props.status = EventStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  updateSettings(settings: Partial<EventSettings>): void {
    this.props.settings = { ...this.props.settings, ...settings };
    this.props.updatedAt = new Date();
  }

  toObject(): EventProps {
    return { ...this.props };
  }
}

