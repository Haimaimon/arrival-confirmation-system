/**
 * Application Layer - Send Invitation WhatsApp Use Case
 * Sends invitation link to guest via WhatsApp
 */

import { IGuestRepository } from '../../../domain/repositories/IGuestRepository';
import { IGuestTokenService } from '../../../domain/services/IGuestTokenService';
import { IWhatsAppService } from '../../../domain/services/IWhatsAppService';

export interface SendInvitationWhatsAppDto {
  guestId: string;
  eventId: string;
}

export interface SendInvitationWhatsAppResult {
  success: boolean;
  message: string;
  messageId?: string;
}

export class SendInvitationWhatsAppUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private tokenService: IGuestTokenService,
    private whatsAppService: IWhatsAppService
  ) {}

  async execute(dto: SendInvitationWhatsAppDto): Promise<SendInvitationWhatsAppResult> {
    // Get guest
    const guest = await this.guestRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Verify guest has phone number
    if (!guest.phone) {
      throw new Error('Guest does not have a phone number');
    }

    // Generate invitation URL
    const invitationUrl = this.tokenService.generateInvitationUrl(dto.guestId, dto.eventId);

    console.log('📤 Sending invitation to:', guest.fullName, 'Phone:', guest.phone);

    // Send via WhatsApp
    const result = await this.whatsAppService.sendInvitationLink(
      guest.phone,
      guest.fullName,
      invitationUrl
    );

    if (result.success) {
      return {
        success: true,
        message: `הקישור נשלח ל-${guest.fullName} בהצלחה! 🎊`,
        messageId: result.messageId,
      };
    } else {
      throw new Error(`Failed to send WhatsApp: ${result.error}`);
    }
  }
}
