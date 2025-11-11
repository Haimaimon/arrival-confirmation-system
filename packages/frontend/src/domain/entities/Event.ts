/**
 * Domain Layer - Event Entity (Frontend)
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

export interface Event {
  id: string;
  userId: string;
  name: string;
  type: EventType;
  status: EventStatus;
  eventDate: string;
  venue: VenueInfo;
  settings: EventSettings;
  totalInvited: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  createdAt: string;
  updatedAt: string;
}

export const getEventTypeLabel = (type: EventType): string => {
  const labels = {
    [EventType.WEDDING]: 'חתונה',
    [EventType.BAR_MITZVAH]: 'בר מצווה',
    [EventType.BAT_MITZVAH]: 'בת מצווה',
    [EventType.BIRTHDAY]: 'יום הולדת',
    [EventType.CORPORATE]: 'אירוע עסקי',
    [EventType.OTHER]: 'אחר',
  };
  return labels[type];
};

export const getEventStatusLabel = (status: EventStatus): string => {
  const labels = {
    [EventStatus.DRAFT]: 'טיוטה',
    [EventStatus.ACTIVE]: 'פעיל',
    [EventStatus.COMPLETED]: 'הושלם',
    [EventStatus.CANCELLED]: 'בוטל',
  };
  return labels[status];
};

export const formatEventDate = (date: Date | string): string => {
  const eventDate = typeof date === 'string' ? new Date(date) : date;
  
  const day = eventDate.getDate();
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  const month = months[eventDate.getMonth()];
  const year = eventDate.getFullYear();
  
  return `${day} ב${month} ${year}`;
};

