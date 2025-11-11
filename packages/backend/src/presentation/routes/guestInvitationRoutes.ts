/**
 * Presentation Layer - Guest Invitation Routes
 * Public routes for guest RSVP confirmation
 */

import { Router } from 'express';
import { GuestInvitationController } from '../controllers/GuestInvitationController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createGuestInvitationRoutes(controller: GuestInvitationController): Router {
  const router = Router();

  // PUBLIC ROUTES - No authentication required
  // Get invitation details
  router.get('/:token', controller.getInvitationDetails);

  // Confirm attendance
  router.post('/:token/confirm', controller.confirmAttendance);

  // ADMIN ROUTES - Authentication required
  // Generate invitation link for a guest
  router.post('/generate', authMiddleware, controller.generateInvitationLink);

  // Send invitation via WhatsApp
  router.post('/send-whatsapp', authMiddleware, controller.sendInvitationWhatsApp);

  return router;
}

