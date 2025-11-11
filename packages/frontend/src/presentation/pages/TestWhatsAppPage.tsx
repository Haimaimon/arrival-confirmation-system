/**
 * Test Page - WhatsApp Testing
 * Quick page to test WhatsApp message sending
 */

import { FC, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TestWhatsAppPage: FC = () => {
  const [phone, setPhone] = useState('+972');
  const [message, setMessage] = useState('שלום! בדיקת אישור הגעה ✨');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSendTest = async () => {
    try {
      setIsSending(true);
      setResult(null);

      // Format phone number
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      console.log('🚀 Sending test WhatsApp message...');
      console.log('To:', formattedPhone);
      console.log('Message:', message);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/v1/test/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({ success: true, data: data.data });
        toast.success('הודעה נשלחה בהצלחה! ✅');
      } else {
        setResult({ success: false, error: data.error || 'Unknown error' });
        toast.error(`שגיאה: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      setResult({ success: false, error: error.message });
      toast.error('שגיאה בשליחת ההודעה');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-green-600" />
          בדיקת WhatsApp
        </h1>
        <p className="text-gray-500">שלח הודעת WhatsApp לבדיקה</p>
      </div>

      {/* Test Form */}
      <Card title="📤 שלח הודעת בדיקה">
        <div className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מספר WhatsApp (בפורמט בינלאומי)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+972-50-123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              דוגמה: +972501234567 (ללא רווחים או מקפים)
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תוכן ההודעה
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="כתוב את ההודעה שלך כאן..."
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTest}
            disabled={isSending || !phone || !message}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
            icon={<Send className="h-5 w-5" />}
          >
            {isSending ? 'שולח...' : 'שלח הודעת WhatsApp'}
          </Button>
        </div>
      </Card>

      {/* Result Display */}
      {result && (
        <Card title={result.success ? '✅ תוצאה' : '❌ שגיאה'}>
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">
                    ההודעה נשלחה בהצלחה!
                  </h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>
                      <strong>Message ID:</strong> {result.data.messageId}
                    </p>
                    <p>
                      <strong>Status:</strong> {result.data.status}
                    </p>
                    {result.data.error && (
                      <p className="text-red-600">
                        <strong>Note:</strong> {result.data.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">שגיאה בשליחה</h3>
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Raw Response */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              הצג תגובה מלאה (Debug)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </Card>
      )}

      {/* Instructions */}
      <Card title="📝 הוראות">
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 לפני הבדיקה:</h4>
            <ol className="list-decimal mr-5 space-y-1">
              <li>ודא שהמספר מאומת ב-Twilio (Trial Account)</li>
              <li>הכנס את המספר בפורמט בינלאומי (+972...)</li>
              <li>ודא ש-Twilio credentials מוגדרים ב-.env</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔧 אם זה לא עובד:</h4>
            <ul className="list-disc mr-5 space-y-1">
              <li>בדוק את לוגים בקונסול (F12)</li>
              <li>בדוק שהבקאנד רץ על port 5000</li>
              <li>בדוק שהמספר מאומת ב-Twilio Console</li>
              <li>ודא ש-Twilio credentials מוגדרים ב-.env</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-yellow-900">
              <strong>⚠️ שים לב:</strong> ב-Trial Account של Twilio אפשר לשלוח רק למספרים
              מאומתים. לך ל-{' '}
              <a
                href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-700"
              >
                Twilio Console
              </a>{' '}
              לאמת מספרים.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestWhatsAppPage;

