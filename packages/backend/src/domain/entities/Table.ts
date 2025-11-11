/**
 * Domain Layer - Table Entity
 * Represents a seating table at an event
 */

export interface TableProps {
  id: string;
  eventId: string;
  tableNumber: number;
  capacity: number;
  section?: string; // e.g., "מרכז", "ימין", "שמאל"
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Table {
  private props: TableProps;

  constructor(props: TableProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  private validateProps(props: TableProps): void {
    if (!props.eventId || props.eventId.trim().length === 0) {
      throw new Error('Event ID is required');
    }
    if (props.tableNumber < 1) {
      throw new Error('Table number must be at least 1');
    }
    if (props.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (props.capacity > 24) {
      throw new Error('Capacity cannot exceed 24 seats per table');
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get tableNumber(): number {
    return this.props.tableNumber;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get section(): string | undefined {
    return this.props.section;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Methods
  updateCapacity(newCapacity: number): void {
    if (newCapacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (newCapacity > 24) {
      throw new Error('Capacity cannot exceed 24 seats per table');
    }
    this.props.capacity = newCapacity;
    this.props.updatedAt = new Date();
  }

  updateSection(section?: string): void {
    this.props.section = section;
    this.props.updatedAt = new Date();
  }

  updateNotes(notes?: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  // Convert to plain object
  toObject(): TableProps {
    return { ...this.props };
  }
}
