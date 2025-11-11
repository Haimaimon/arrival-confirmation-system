/**
 * Infrastructure Layer - Twilio Notification Service Implementation
 * Handles SMS, WhatsApp, and Voice calls using Twilio API
 */

import twilio from 'twilio';
import {
  INotificationService,
  NotificationResponse,
  NotificationStatus,
} from '../../domain/services/INotificationService';

export class TwilioNotificationService implements INotificationService {
  private client: twilio.Twilio;
  private fromPhone: string;
  private whatsappFrom: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '';
    this.whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${this.fromPhone}`;

    if (!accountSid || !authToken || !this.fromPhone) {
      console.warn('⚠️ Twilio credentials not configured. Notification service will run in demo mode.');
      // Create a mock client for development
      this.client = null as any;
    } else {
      this.client = twilio(accountSid, authToken);
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(to: string, message: string): Promise<NotificationResponse> {
    try {
      // Demo mode - simulate sending
      if (!this.client) {
        console.log('📱 [DEMO] SMS would be sent to:', to, 'Message:', message);
        return {
          success: true,
          messageId: `demo_sms_${Date.now()}`,
          status: NotificationStatus.SENT,
        };
      }

      // Format phone number for Israeli numbers
      const formattedPhone = this.formatIsraeliPhone(to);

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to: formattedPhone,
      });

      console.log('✅ SMS sent successfully:', twilioMessage.sid);

      return {
        success: true,
        messageId: twilioMessage.sid,
        status: this.mapTwilioStatus(twilioMessage.status),
      };
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error.message);
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(to: string, message: string): Promise<NotificationResponse> {
    try {
      // Demo mode - simulate sending
      if (!this.client) {
        console.log('💬 [DEMO] WhatsApp would be sent to:', to, 'Message:', message);
        return {
          success: true,
          messageId: `demo_whatsapp_${Date.now()}`,
          status: NotificationStatus.SENT,
        };
      }

      // Format phone number for WhatsApp
      const formattedPhone = this.formatIsraeliPhone(to);
      const whatsappTo = `whatsapp:${formattedPhone}`;

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.whatsappFrom,
        to: whatsappTo,
      });

      console.log('✅ WhatsApp sent successfully:', twilioMessage.sid);

      return {
        success: true,
        messageId: twilioMessage.sid,
        status: this.mapTwilioStatus(twilioMessage.status),
      };
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp:', error.message);
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Make automated voice call
   */
  async makeVoiceCall(to: string, message: string): Promise<NotificationResponse> {
    try {
      // Demo mode - simulate call
      if (!this.client) {
        console.log('📞 [DEMO] Voice call would be made to:', to, 'Message:', message);
        return {
          success: true,
          messageId: `demo_call_${Date.now()}`,
          status: NotificationStatus.SENT,
        };
      }

      // Format phone number
      const formattedPhone = this.formatIsraeliPhone(to);

      // Create TwiML for voice message
      const twiml = this.createVoiceTwiML(message);

      const call = await this.client.calls.create({
        twiml,
        from: this.fromPhone,
        to: formattedPhone,
      });

      console.log('✅ Voice call initiated:', call.sid);

      return {
        success: true,
        messageId: call.sid,
        status: NotificationStatus.SENT,
      };
    } catch (error: any) {
      console.error('❌ Error making voice call:', error.message);
      return {
        success: false,
        status: NotificationStatus.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<NotificationStatus> {
    try {
      if (!this.client) {
        return NotificationStatus.DELIVERED;
      }

      const message = await this.client.messages(messageId).fetch();
      return this.mapTwilioStatus(message.status);
    } catch (error: any) {
      console.error('❌ Error fetching message status:', error.message);
      return NotificationStatus.FAILED;
    }
  }

  /**
   * Format Israeli phone number to international format
   */
  private formatIsraeliPhone(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with +972
    if (cleaned.startsWith('0')) {
      cleaned = '+972' + cleaned.substring(1);
    }

    // If doesn't start with +, add +972
    if (!cleaned.startsWith('+')) {
      cleaned = '+972' + cleaned;
    }

    return cleaned;
  }

  /**
   * Map Twilio status to our NotificationStatus
   */
  private mapTwilioStatus(twilioStatus: string): NotificationStatus {
    switch (twilioStatus.toLowerCase()) {
      case 'delivered':
        return NotificationStatus.DELIVERED;
      case 'sent':
      case 'queued':
        return NotificationStatus.SENT;
      case 'failed':
      case 'undelivered':
        return NotificationStatus.FAILED;
      default:
        return NotificationStatus.PENDING;
    }
  }

  /**
   * Create TwiML for voice message (Hebrew support)
   */
  private createVoiceTwiML(message: string): string {
    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="he-IL" voice="man">${this.escapeXml(message)}</Say>
        <Pause length="1"/>
        <Say language="he-IL" voice="man">תודה רבה</Say>
      </Response>
    `.trim();
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
