/**
 * Domain Layer - Guest Token Service Interface
 * Service for generating and validating guest invitation tokens
 */

export interface IGuestTokenService {
  /**
   * Generate a unique token for a guest invitation link
   * @param guestId - Guest ID
   * @param eventId - Event ID
   * @returns Signed token string
   */
  generateGuestToken(guestId: string, eventId: string): string;

  /**
   * Validate and decode a guest token
   * @param token - Token to validate
   * @returns Decoded payload or null if invalid
   */
  verifyGuestToken(token: string): { guestId: string; eventId: string } | null;

  /**
   * Generate a full invitation URL
   * @param guestId - Guest ID
   * @param eventId - Event ID
   * @returns Full URL for guest confirmation
   */
  generateInvitationUrl(guestId: string, eventId: string): string;
}

