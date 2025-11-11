/**
 * Domain Layer - WhatsApp Service Interface
 * Interface for sending WhatsApp messages
 */

export interface SendWhatsAppMessageDto {
  phone: string;
  message: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppService {
  /**
   * Send a WhatsApp text message
   */
  sendMessage(dto: SendWhatsAppMessageDto): Promise<SendWhatsAppResult>;

  /**
   * Send invitation link via WhatsApp
   */
  sendInvitationLink(phone: string, guestName: string, invitationUrl: string): Promise<SendWhatsAppResult>;

  /**
   * Check if service is configured properly
   */
  isConfigured(): boolean;
}

