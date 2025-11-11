/**
 * Domain Layer - User Entity
 * Manages user accounts and authentication
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  SUPPORT = 'SUPPORT',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  private validateProps(props: UserProps): void {
    if (!this.isValidEmail(props.email)) {
      throw new Error('Invalid email address');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (!this.isValidPhone(props.phone)) {
      throw new Error('Invalid phone number');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+972|972|0)([23489]|5[0-9])\d{7}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
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

  get phone(): string {
    return this.props.phone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get subscriptionTier(): SubscriptionTier {
    return this.props.subscriptionTier;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get isPhoneVerified(): boolean {
    return this.props.isPhoneVerified;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  // Business logic
  canCreateEvent(): boolean {
    return this.props.isActive && this.props.isEmailVerified;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isSupport(): boolean {
    return this.props.role === UserRole.SUPPORT;
  }

  canAccessPremiumFeatures(): boolean {
    return (
      this.props.subscriptionTier === SubscriptionTier.PREMIUM ||
      this.props.subscriptionTier === SubscriptionTier.ENTERPRISE
    );
  }

  verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }

  verifyPhone(): void {
    this.props.isPhoneVerified = true;
    this.props.updatedAt = new Date();
  }

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  upgradeTo(tier: SubscriptionTier): void {
    this.props.subscriptionTier = tier;
    this.props.updatedAt = new Date();
  }

  toObject(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash, ...userWithoutPassword } = this.props;
    return userWithoutPassword;
  }

  toObjectWithPassword(): UserProps {
    return { ...this.props };
  }
}

