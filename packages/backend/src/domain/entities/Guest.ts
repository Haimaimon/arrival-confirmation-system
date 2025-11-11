/**
 * Domain Layer - Guest Entity
 * Pure business logic, no external dependencies
 */

export enum GuestStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  NO_RESPONSE = 'NO_RESPONSE',
}

export enum GuestType {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  INFANT = 'INFANT',
}

export interface GuestProps {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  phone?: string; // Phone is now optional
  email?: string;
  type: string; // Can be GROOM, BRIDE, MUTUAL or any custom type
  status: GuestStatus;
  numberOfGuests: number;
  tableNumber?: number;
  seatNumber?: number;
  notes?: string;
  smsCount: number;
  whatsappCount: number;
  phoneCallCount: number;
  lastContactedAt?: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Guest {
  private props: GuestProps;

  constructor(props: GuestProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  private validateProps(props: GuestProps): void {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    // Phone is optional, but if provided, must be valid
    if (props.phone && props.phone.trim() !== '' && !this.isValidPhone(props.phone)) {
      throw new Error('Invalid phone number');
    }
    if (props.numberOfGuests < 1) {
      throw new Error('Number of guests must be at least 1');
    }
    if (props.smsCount < 0 || props.smsCount > 2) {
      throw new Error('SMS count must be between 0 and 2');
    }
    if (props.whatsappCount < 0 || props.whatsappCount > 3) {
      throw new Error('WhatsApp count must be between 0 and 3');
    }
    if (props.phoneCallCount < 0 || props.phoneCallCount > 4) {
      throw new Error('Phone call count must be between 0 and 4');
    }
  }

  private isValidPhone(phone: string): boolean {
    // Israeli phone validation
    const phoneRegex = /^(\+972|972|0)([23489]|5[0-9])\d{7}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get type(): string {
    return this.props.type;
  }

  get status(): GuestStatus {
    return this.props.status;
  }

  get numberOfGuests(): number {
    return this.props.numberOfGuests;
  }

  get tableNumber(): number | undefined {
    return this.props.tableNumber;
  }

  get seatNumber(): number | undefined {
    return this.props.seatNumber;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get smsCount(): number {
    return this.props.smsCount;
  }

  get whatsappCount(): number {
    return this.props.whatsappCount;
  }

  get phoneCallCount(): number {
    return this.props.phoneCallCount;
  }

  get lastContactedAt(): Date | undefined {
    return this.props.lastContactedAt;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods
  canSendSms(): boolean {
    return this.props.smsCount < 2 && this.props.status !== GuestStatus.CONFIRMED;
  }

  canSendWhatsApp(): boolean {
    return this.props.whatsappCount < 3 && this.props.status !== GuestStatus.CONFIRMED;
  }

  canMakePhoneCall(): boolean {
    return this.props.phoneCallCount < 4 && this.props.status !== GuestStatus.CONFIRMED;
  }

  markSmsSent(): void {
    if (!this.canSendSms()) {
      throw new Error('Cannot send more SMS messages to this guest');
    }
    this.props.smsCount++;
    this.props.lastContactedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markWhatsAppSent(): void {
    if (!this.canSendWhatsApp()) {
      throw new Error('Cannot send more WhatsApp messages to this guest');
    }
    this.props.whatsappCount++;
    this.props.lastContactedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markPhoneCallMade(): void {
    if (!this.canMakePhoneCall()) {
      throw new Error('Cannot make more phone calls to this guest');
    }
    this.props.phoneCallCount++;
    this.props.lastContactedAt = new Date();
    this.props.updatedAt = new Date();
  }

  confirm(): void {
    if (this.props.status === GuestStatus.CONFIRMED) {
      throw new Error('Guest is already confirmed');
    }
    this.props.status = GuestStatus.CONFIRMED;
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();
  }

  decline(): void {
    if (this.props.status === GuestStatus.DECLINED) {
      throw new Error('Guest has already declined');
    }
    this.props.status = GuestStatus.DECLINED;
    this.props.updatedAt = new Date();
  }

  assignSeat(tableNumber: number, seatNumber: number): void {
    if (tableNumber < 1) {
      throw new Error('Table number must be positive');
    }
    if (seatNumber < 1) {
      throw new Error('Seat number must be positive');
    }
    this.props.tableNumber = tableNumber;
    this.props.seatNumber = seatNumber;
    this.props.updatedAt = new Date();
  }

  updateNumberOfGuests(count: number): void {
    if (count < 1) {
      throw new Error('Number of guests must be at least 1');
    }
    this.props.numberOfGuests = count;
    this.props.updatedAt = new Date();
  }

  toObject(): GuestProps {
    return { ...this.props };
  }
}

