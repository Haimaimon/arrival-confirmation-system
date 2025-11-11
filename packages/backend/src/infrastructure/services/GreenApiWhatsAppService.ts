/**
 * Infrastructure Layer - Green API WhatsApp Service
 * Implementation using Green API for WhatsApp messaging
 * 
 * Setup Instructions:
 * 1. Sign up at https://green-api.com
 * 2. Get your Instance ID and API Token
 * 3. Add to .env:
 *    GREEN_API_INSTANCE_ID=your_instance_id
 *    GREEN_API_TOKEN=your_api_token
 */

import axios from 'axios';
import { IWhatsAppService, SendWhatsAppMessageDto, SendWhatsAppResult } from '../../domain/services/IWhatsAppService';

export class GreenApiWhatsAppService implements IWhatsAppService {
  private instanceId: string;
  private apiToken: string;
  private baseUrl: string;
  private isDemo: boolean;

  constructor() {
    this.instanceId = process.env.GREEN_API_INSTANCE_ID || '';
    this.apiToken = process.env.GREEN_API_TOKEN || '';
    this.baseUrl = 'https://api.green-api.com';
    
    // Demo mode if not configured
    this.isDemo = !this.instanceId || !this.apiToken;
    
    if (this.isDemo) {
      console.warn('⚠️  Green API not configured - running in DEMO mode');
      console.warn('📝 Add GREEN_API_INSTANCE_ID and GREEN_API_TOKEN to .env');
    } else {
      console.log('✅ Green API configured successfully');
    }
  }

  isConfigured(): boolean {
    return !this.isDemo;
  }

  /**
   * Send a WhatsApp text message
   */
  async sendMessage(dto: SendWhatsAppMessageDto): Promise<SendWhatsAppResult> {
    if (this.isDemo) {
      return this.mockSendMessage(dto);
    }

    try {
      // Format phone number for Green API (remove + and spaces)
      const formattedPhone = this.formatPhoneNumber(dto.phone);
      
      const url = `${this.baseUrl}/waInstance${this.instanceId}/sendMessage/${this.apiToken}`;
      
      const payload = {
        chatId: `${formattedPhone}@c.us`, // Green API format
        message: dto.message,
      };

      console.log('📤 Sending WhatsApp via Green API:', { phone: formattedPhone });

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data && response.data.idMessage) {
        console.log('✅ WhatsApp sent successfully:', response.data.idMessage);
        return {
          success: true,
          messageId: response.data.idMessage,
        };
      }

      console.error('❌ Unexpected response from Green API:', response.data);
      return {
        success: false,
        error: 'Unexpected response format',
      };

    } catch (error: any) {
      console.error('❌ Error sending WhatsApp:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Send invitation link via WhatsApp with a nice template
   */
  async sendInvitationLink(
    phone: string,
    guestName: string,
    invitationUrl: string
  ): Promise<SendWhatsAppResult> {
    const message = this.createInvitationMessage(guestName, invitationUrl);
    return this.sendMessage({ phone, message });
  }

  /**
   * Format phone number for Green API
   * Input: +972501234567, 972501234567, 0501234567
   * Output: 972501234567
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 972
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1);
    }
    
    // Remove leading + if exists
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Create a beautiful invitation message
   */
  private createInvitationMessage(guestName: string, invitationUrl: string): string {
    return `🎊 *שלום ${guestName}!*

אנחנו שמחים להזמין אתכם לאירוע שלנו! 💕

🔗 *לאישור הגעה לחצו כאן:*
${invitationUrl}

נשמח לראותכם! ✨

_הודעה זו נשלחה דרך מערכת אישור הגעה דיגיטלית_`;
  }

  /**
   * Mock implementation for demo mode
   */
  private mockSendMessage(dto: SendWhatsAppMessageDto): Promise<SendWhatsAppResult> {
    console.log('🎭 DEMO MODE - WhatsApp message:');
    console.log('📱 To:', dto.phone);
    console.log('💬 Message:', dto.message);
    console.log('─'.repeat(50));
    
    return Promise.resolve({
      success: true,
      messageId: `demo_${Date.now()}`,
    });
  }
}

