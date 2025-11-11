/**
 * Presentation Layer - Test Controller
 * For testing various features during development
 * 
 * NOTE: These endpoints are PUBLIC (no auth required) for easy testing
 */

import { Request, Response } from 'express';
import { TwilioNotificationService } from '../../infrastructure/services/TwilioNotificationService';

export class TestController {
  private twilioService: TwilioNotificationService;

  constructor() {
    this.twilioService = new TwilioNotificationService();
  }

  /**
   * Test WhatsApp message sending
   */
  testWhatsApp = async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to, message',
        });
      }

      console.log('📱 Test WhatsApp Request:');
      console.log('  To:', to);
      console.log('  Message:', message);

      // Send WhatsApp message
      const result = await this.twilioService.sendWhatsApp(to, message);

      console.log('📤 WhatsApp Result:', result);

      return res.json({
        success: result.success,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Test WhatsApp Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Test SMS message sending
   */
  testSMS = async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to, message',
        });
      }

      console.log('📱 Test SMS Request:');
      console.log('  To:', to);
      console.log('  Message:', message);

      // Send SMS message
      const result = await this.twilioService.sendSMS(to, message);

      console.log('📤 SMS Result:', result);

      return res.json({
        success: result.success,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Test SMS Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Test Voice call
   */
  testVoiceCall = async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to, message',
        });
      }

      console.log('📞 Test Voice Call Request:');
      console.log('  To:', to);
      console.log('  Message:', message);

      // Make voice call
      const result = await this.twilioService.makeVoiceCall(to, message);

      console.log('📤 Voice Call Result:', result);

      return res.json({
        success: result.success,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Test Voice Call Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Check Twilio configuration
   */
  checkConfig = async (_req: Request, res: Response) => {
    try {
      const hasAccountSid = !!process.env.TWILIO_ACCOUNT_SID;
      const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN;
      const hasPhoneNumber = !!process.env.TWILIO_PHONE_NUMBER;
      const hasWhatsAppNumber = !!process.env.TWILIO_WHATSAPP_NUMBER;

      const isConfigured = hasAccountSid && hasAuthToken && hasPhoneNumber;

      return res.json({
        success: true,
        data: {
          configured: isConfigured,
          hasAccountSid,
          hasAuthToken,
          hasPhoneNumber,
          hasWhatsAppNumber,
          accountSid: hasAccountSid
            ? `${process.env.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`
            : null,
          phoneNumber: hasPhoneNumber ? process.env.TWILIO_PHONE_NUMBER : null,
          mode: isConfigured ? 'LIVE' : 'DEMO',
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

