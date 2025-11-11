/**
 * Quick WhatsApp Test Script
 * Run this to quickly test WhatsApp sending without the full app
 * 
 * Usage:
 *   node test-whatsapp.js +972501234567 "הודעת בדיקה"
 */

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Get command line arguments
const args = process.argv.slice(2);
const toNumber = args[0] || '+972501234567';
const message = args[1] || 'שלום! בדיקת אישור הגעה ✨';

console.log('\n📱 WhatsApp Test Script\n');
console.log('Configuration:');
console.log('  Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : '❌ Missing');
console.log('  Auth Token:', authToken ? '✅ Set' : '❌ Missing');
console.log('  WhatsApp Number:', whatsappNumber || '❌ Missing');
console.log('\nMessage Details:');
console.log('  To:', toNumber);
console.log('  Message:', message);
console.log('\n');

if (!accountSid || !authToken) {
  console.error('❌ Error: Twilio credentials not found in .env file');
  console.log('\nPlease add these to your .env file:');
  console.log('  TWILIO_ACCOUNT_SID=your_account_sid');
  console.log('  TWILIO_AUTH_TOKEN=your_auth_token');
  console.log('  TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886');
  process.exit(1);
}

// Initialize Twilio client
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

// Send WhatsApp message
async function sendWhatsApp() {
  try {
    console.log('📤 Sending WhatsApp message...\n');

    const result = await client.messages.create({
      body: message,
      from: whatsappNumber || 'whatsapp:+14155238886',
      to: `whatsapp:${toNumber}`,
    });

    console.log('✅ Success!');
    console.log('\nMessage Details:');
    console.log('  Message ID:', result.sid);
    console.log('  Status:', result.status);
    console.log('  Date Created:', result.dateCreated);
    console.log('  From:', result.from);
    console.log('  To:', result.to);
    console.log('\n📱 Check your WhatsApp for the message!');
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:');
    console.error('  Message:', error.message);
    
    if (error.code === 21608) {
      console.log('\n💡 Tip: This number might not be verified in your Twilio account.');
      console.log('   Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('   Add and verify the number: ' + toNumber);
    }
    
    if (error.code === 63007) {
      console.log('\n💡 Tip: WhatsApp sender must join the Twilio Sandbox first.');
      console.log('   Send "join whom-fine" to +1 415 523 8886 on WhatsApp');
      console.log('   Or check: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    }
    
    console.log('\n   Error Code:', error.code);
    console.log('   More Info:', error.moreInfo);
  }
}

sendWhatsApp();

