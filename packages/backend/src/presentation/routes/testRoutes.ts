/**
 * Presentation Layer - Test Routes
 * Routes for testing features during development
 * 
 * NOTE: These routes are PUBLIC (no auth required) for easy testing
 * Remove or secure these routes in production!
 */

import { Router } from 'express';
import { TestController } from '../controllers/TestController';

export function createTestRoutes(controller: TestController): Router {
  const router = Router();

  // NOTE: No authentication required for test routes
  // This makes testing easier during development
  // ⚠️ REMOVE OR SECURE THESE IN PRODUCTION! ⚠️

  // Test WhatsApp
  router.post('/whatsapp', controller.testWhatsApp);

  // Test SMS
  router.post('/sms', controller.testSMS);

  // Test Voice Call
  router.post('/voice', controller.testVoiceCall);

  // Check Twilio configuration
  router.get('/config', controller.checkConfig);

  return router;
}

