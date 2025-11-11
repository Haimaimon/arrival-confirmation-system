/**
 * Infrastructure Layer - Guest Token Service Implementation
 * JWT-based token generation for guest invitations
 */

import jwt from 'jsonwebtoken';
import { IGuestTokenService } from '../../domain/services/IGuestTokenService';

export class GuestTokenService implements IGuestTokenService {
  private readonly secret: string;
  private readonly frontendUrl: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  }

  generateGuestToken(guestId: string, eventId: string): string {
    const payload = {
      guestId,
      eventId,
      type: 'guest_invitation',
    };

    // Token expires in 180 days (6 months) - enough for wedding invitations
    const token = jwt.sign(payload, this.secret, {
      expiresIn: '180d',
    });

    return token;
  }

  verifyGuestToken(token: string): { guestId: string; eventId: string } | null {
    try {
      const decoded = jwt.verify(token, this.secret) as any;

      // Verify it's a guest invitation token
      if (decoded.type !== 'guest_invitation') {
        return null;
      }

      return {
        guestId: decoded.guestId,
        eventId: decoded.eventId,
      };
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  generateInvitationUrl(guestId: string, eventId: string): string {
    const token = this.generateGuestToken(guestId, eventId);
    return `${this.frontendUrl}/invitation/${token}`;
  }
}

