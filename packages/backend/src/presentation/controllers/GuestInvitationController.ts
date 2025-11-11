/**
 * Presentation Layer - Guest Invitation Controller
 * Public endpoints for guest RSVP confirmation
 */

import { Request, Response } from 'express';
import { GetGuestInvitationDetailsUseCase } from '../../application/use-cases/guest/GetGuestInvitationDetailsUseCase';
import { ConfirmGuestAttendanceUseCase, AttendanceResponse } from '../../application/use-cases/guest/ConfirmGuestAttendanceUseCase';
import { SendInvitationWhatsAppUseCase } from '../../application/use-cases/guest/SendInvitationWhatsAppUseCase';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IGuestTokenService } from '../../domain/services/IGuestTokenService';
import { IWhatsAppService } from '../../domain/services/IWhatsAppService';
import { ICacheService } from '../../domain/services/ICacheService';

export class GuestInvitationController {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private tokenService: IGuestTokenService,
    private whatsAppService: IWhatsAppService,
    private cacheService: ICacheService
  ) {}

  /**
   * Get invitation details
   * GET /api/v1/invitations/:token
   */
  getInvitationDetails = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      console.log('🎊 Public: Fetching invitation details for token');

      const useCase = new GetGuestInvitationDetailsUseCase(
        this.guestRepository,
        this.eventRepository,
        this.tokenService
      );

      const details = await useCase.execute(token);

      console.log('✅ Public: Invitation details fetched for guest:', details.guest.fullName);
      return res.json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      console.error('❌ Public: Error fetching invitation:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Confirm guest attendance
   * POST /api/v1/invitations/:token/confirm
   */
  confirmAttendance = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { response, numberOfGuests, notes } = req.body;

      console.log('🎊 Public: Guest confirming attendance:', { response, numberOfGuests });

      // Validate response
      if (!Object.values(AttendanceResponse).includes(response)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid response type',
        });
      }

      const useCase = new ConfirmGuestAttendanceUseCase(
        this.guestRepository,
        this.eventRepository,
        this.tokenService
      );

      const result = await useCase.execute({
        token,
        response,
        numberOfGuests,
        notes,
      });

      // Invalidate cache for this event
      const tokenData = this.tokenService.verifyGuestToken(token);
      if (tokenData) {
        console.log('🗑️ Public: Clearing cache after confirmation for event:', tokenData.eventId);
        await this.cacheService.deletePattern(`guests:${tokenData.eventId}:*`);
        await this.cacheService.deletePattern(`tables:stats:${tokenData.eventId}`);
        // Invalidate event cache as well
        await this.cacheService.delete(`event:${tokenData.eventId}`);
      }

      console.log('✅ Public: Attendance confirmed:', result.guestName);
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Public: Error confirming attendance:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Generate invitation link for a guest (Admin only)
   * POST /api/v1/invitations/generate
   */
  generateInvitationLink = async (req: Request, res: Response) => {
    try {
      const { guestId, eventId } = req.body;

      if (!guestId || !eventId) {
        return res.status(400).json({
          success: false,
          error: 'Guest ID and Event ID are required',
        });
      }

      // Verify guest exists
      const guest = await this.guestRepository.findById(guestId);
      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found',
        });
      }

      const invitationUrl = this.tokenService.generateInvitationUrl(guestId, eventId);

      console.log('✅ Admin: Generated invitation link for guest:', guest.fullName);
      return res.json({
        success: true,
        data: {
          invitationUrl,
          guestName: guest.fullName,
        },
      });
    } catch (error: any) {
      console.error('❌ Admin: Error generating invitation link:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Send invitation via WhatsApp (Admin only)
   * POST /api/v1/invitations/send-whatsapp
   */
  sendInvitationWhatsApp = async (req: Request, res: Response) => {
    try {
      const { guestId, eventId } = req.body;

      if (!guestId || !eventId) {
        return res.status(400).json({
          success: false,
          error: 'Guest ID and Event ID are required',
        });
      }

      console.log('📱 Admin: Sending WhatsApp invitation to guest:', guestId);

      const useCase = new SendInvitationWhatsAppUseCase(
        this.guestRepository,
        this.tokenService,
        this.whatsAppService
      );

      const result = await useCase.execute({
        guestId,
        eventId,
      });

      console.log('✅ Admin: WhatsApp invitation sent successfully');
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Admin: Error sending WhatsApp invitation:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

