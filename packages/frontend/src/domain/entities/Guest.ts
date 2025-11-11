/**
 * Domain Layer - Guest Entity (Frontend)
 */

export enum GuestStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  NO_RESPONSE = 'NO_RESPONSE',
}

export enum GuestType {
  GROOM = 'GROOM',
  BRIDE = 'BRIDE',
  MUTUAL = 'MUTUAL',
}

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  phone?: string;
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
  lastContactedAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const getGuestStatusLabel = (status: GuestStatus): string => {
  const labels = {
    [GuestStatus.PENDING]: 'ממתין',
    [GuestStatus.CONFIRMED]: 'אישר',
    [GuestStatus.DECLINED]: 'סירב',
    [GuestStatus.NO_RESPONSE]: 'לא הגיב',
  };
  return labels[status];
};

export const getGuestStatusColor = (status: GuestStatus): string => {
  const colors = {
    [GuestStatus.PENDING]: 'text-warning-600 bg-warning-50',
    [GuestStatus.CONFIRMED]: 'text-success-600 bg-success-50',
    [GuestStatus.DECLINED]: 'text-danger-600 bg-danger-50',
    [GuestStatus.NO_RESPONSE]: 'text-gray-600 bg-gray-50',
  };
  return colors[status];
};

export const getGuestTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'GROOM': 'חתן',
    'BRIDE': 'כלה',
    'MUTUAL': 'משותף',
  };
  return labels[type] || type;
};

