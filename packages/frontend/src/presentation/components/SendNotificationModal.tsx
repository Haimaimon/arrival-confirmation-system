/**
 * Presentation Layer - Send Notification Modal
 * Beautiful UI for sending SMS, WhatsApp, and Voice messages to guests
 */

import { FC, useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Guest } from '../../domain/entities/Guest';
import { MessageSquare, Phone, Send, AlertCircle } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onSend: (guestId: string, type: 'SMS' | 'WHATSAPP' | 'VOICE', message?: string) => void;
  isSending?: boolean;
}

type NotificationType = 'SMS' | 'WHATSAPP' | 'VOICE';

interface NotificationLimits {
  SMS: { current: number; max: number };
  WHATSAPP: { current: number; max: number };
  VOICE: { current: number; max: number };
}

export const SendNotificationModal: FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSend,
  isSending = false,
}) => {
  const [selectedType, setSelectedType] = useState<NotificationType>('SMS');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);

  if (!guest) return null;

  // Calculate notification limits
  const limits: NotificationLimits = {
    SMS: { current: guest.smsCount || 0, max: 2 },
    WHATSAPP: { current: guest.whatsappCount || 0, max: 3 },
    VOICE: { current: guest.phoneCallCount || 0, max: 4 },
  };

  const canSend = limits[selectedType].current < limits[selectedType].max;

  // Default messages
  const defaultMessages = {
    SMS: `שלום ${guest.firstName}, אנו מזמינים אותך לאירוע שלנו. נשמח לקבל אישור הגעה. תודה!`,
    WHATSAPP: `היי ${guest.firstName} 👋\nאנו שמחים להזמין אותך לאירוע המיוחד שלנו! 💐\nנשמח לקבל אישור הגעה.\nתודה רבה! 🎉`,
    VOICE: `שלום ${guest.firstName}. אנו מזמינים אותך לאירוע שלנו. נשמח לקבל אישור הגעה.`,
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!canSend) {
      return;
    }

    const message = useCustomMessage && customMessage.trim() ? customMessage : undefined;
    onSend(guest.id, selectedType, message);
  };

  const getTypeColor = (type: NotificationType): string => {
    const colors = {
      SMS: 'from-blue-500 to-blue-600',
      WHATSAPP: 'from-green-500 to-green-600',
      VOICE: 'from-purple-500 to-purple-600',
    };
    return colors[type];
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'SMS':
        return <MessageSquare className="h-5 w-5" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-5 w-5" />;
      case 'VOICE':
        return <Phone className="h-5 w-5" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📤 שלח הודעה" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {guest.firstName} {guest.lastName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {guest.phone}
          </p>
        </div>

        {/* Notification Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            בחר סוג הודעה
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMS Card */}
            <button
              type="button"
              onClick={() => setSelectedType('SMS')}
              disabled={limits.SMS.current >= limits.SMS.max}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedType === 'SMS'
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              } ${
                limits.SMS.current >= limits.SMS.max
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${getTypeColor('SMS')} text-white mx-auto mb-2`}>
                {getTypeIcon('SMS')}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">SMS</h4>
              <p className="text-xs text-gray-600">
                {limits.SMS.current}/{limits.SMS.max} נשלחו
              </p>
              {limits.SMS.current >= limits.SMS.max && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    מלא
                  </span>
                </div>
              )}
            </button>

            {/* WhatsApp Card */}
            <button
              type="button"
              onClick={() => setSelectedType('WHATSAPP')}
              disabled={limits.WHATSAPP.current >= limits.WHATSAPP.max}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedType === 'WHATSAPP'
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-green-300'
              } ${
                limits.WHATSAPP.current >= limits.WHATSAPP.max
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${getTypeColor('WHATSAPP')} text-white mx-auto mb-2`}>
                {getTypeIcon('WHATSAPP')}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">WhatsApp</h4>
              <p className="text-xs text-gray-600">
                {limits.WHATSAPP.current}/{limits.WHATSAPP.max} נשלחו
              </p>
              {limits.WHATSAPP.current >= limits.WHATSAPP.max && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    מלא
                  </span>
                </div>
              )}
            </button>

            {/* Voice Card */}
            <button
              type="button"
              onClick={() => setSelectedType('VOICE')}
              disabled={limits.VOICE.current >= limits.VOICE.max}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedType === 'VOICE'
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              } ${
                limits.VOICE.current >= limits.VOICE.max
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${getTypeColor('VOICE')} text-white mx-auto mb-2`}>
                {getTypeIcon('VOICE')}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">שיחה קולית</h4>
              <p className="text-xs text-gray-600">
                {limits.VOICE.current}/{limits.VOICE.max} נשלחו
              </p>
              {limits.VOICE.current >= limits.VOICE.max && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    מלא
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Custom Message Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="useCustomMessage"
            checked={useCustomMessage}
            onChange={(e) => setUseCustomMessage(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="useCustomMessage" className="text-sm font-medium text-gray-700">
            השתמש בהודעה מותאמת אישית
          </label>
        </div>

        {/* Message Preview/Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {useCustomMessage ? 'הודעה מותאמת אישית' : 'תצוגה מקדימה של ההודעה'}
          </label>
          <textarea
            value={useCustomMessage ? customMessage : defaultMessages[selectedType]}
            onChange={(e) => setCustomMessage(e.target.value)}
            disabled={!useCustomMessage}
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg ${
              useCustomMessage
                ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            } transition-all`}
            placeholder="כתוב את ההודעה שלך כאן..."
          />
          {selectedType === 'WHATSAPP' && (
            <p className="text-xs text-gray-500 mt-1">
              💡 ניתן להשתמש באימוג'ים בהודעות WhatsApp!
            </p>
          )}
        </div>

        {/* Warning if limit reached */}
        {!canSend && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">
                הגעת למגבלת ההודעות
              </h4>
              <p className="text-sm text-red-700 mt-1">
                נשלחו כבר {limits[selectedType].max} הודעות מסוג {selectedType} לאורח זה.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSending}>
            ביטול
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSending || !canSend}
            className={`flex items-center gap-2 ${
              canSend
                ? `bg-gradient-to-r ${getTypeColor(selectedType)} hover:opacity-90`
                : ''
            }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                שלח {selectedType}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

