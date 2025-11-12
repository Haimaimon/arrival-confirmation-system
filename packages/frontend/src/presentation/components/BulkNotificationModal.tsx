/**
 * Presentation Layer - Bulk Notification Modal
 * Allows sending notifications to multiple guests at once
 */

import { FC, useMemo, useState, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { MessageSquare, Phone, Users } from 'lucide-react';
import { Guest } from '../../domain/entities/Guest';

type NotificationType = 'SMS' | 'WHATSAPP' | 'VOICE';

interface BulkNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  mode: 'selected' | 'all';
  onSend: (payload: { type: NotificationType; message?: string }) => void;
  isSending?: boolean;
}

const TYPE_LABELS: Record<NotificationType, string> = {
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  VOICE: 'שיחה קולית',
};

const TYPE_COLORS: Record<NotificationType, string> = {
  SMS: 'from-blue-500 to-blue-600',
  WHATSAPP: 'from-green-500 to-green-600',
  VOICE: 'from-purple-500 to-purple-600',
};

const TYPE_ICONS: Record<NotificationType, JSX.Element> = {
  SMS: <MessageSquare className="h-5 w-5" />,
  WHATSAPP: <MessageSquare className="h-5 w-5" />,
  VOICE: <Phone className="h-5 w-5" />,
};

export const BulkNotificationModal: FC<BulkNotificationModalProps> = ({
  isOpen,
  onClose,
  guests,
  mode,
  onSend,
  isSending = false,
}) => {
  const [selectedType, setSelectedType] = useState<NotificationType>('WHATSAPP');
  const [message, setMessage] = useState('');

  const defaultMessages = useMemo(() => {
    const firstGuest = guests[0];
    const firstName = firstGuest ? firstGuest.firstName : 'אורח';

    return {
      SMS: `שלום ${firstName}, אנו מזמינים אותך לאירוע שלנו. נשמח לראותך.`,
      WHATSAPP: `היי ${firstName} 👋\nאנחנו שמחים להזמין אתכם לאירוע שלנו! 💐\nנשמח לקבל אישור הגעה 🙏`,
      VOICE: `שלום ${firstName}. אנו מזמינים אותך לאירוע שלנו. נשמח לראותך.`,
    };
  }, [guests]);

  useEffect(() => {
    if (isOpen) {
      setSelectedType('WHATSAPP');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessages[selectedType]);
    }
  }, [defaultMessages, isOpen, selectedType]);

  const totalRecipients = guests.length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const messageToSend = message.trim();
    onSend({ type: selectedType, message: messageToSend || undefined });
  };

  const renderTypeCard = (type: NotificationType) => {
    const isSelected = selectedType === type;

    return (
      <button
        type="button"
        key={type}
        onClick={() => setSelectedType(type)}
        className={`relative p-4 rounded-xl border-2 transition-all ${
          isSelected ? 'border-primary-500 bg-primary-50 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-primary-300'
        }`}
      >
        <div
          className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${TYPE_COLORS[type]} text-white mx-auto mb-2`}
        >
          {TYPE_ICONS[type]}
        </div>
        <h4 className="font-semibold text-gray-800 mb-1">{TYPE_LABELS[type]}</h4>
      </button>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="שליחת הודעה מרוכזת"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg flex items-center gap-4">
          <Users className="h-10 w-10 text-primary-600" />
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {mode === 'all'
                ? `שליחה לכל ${totalRecipients} האורחים באירוע`
                : `שליחה ל-${totalRecipients} אורחים שנבחרו`}
            </p>
            <p className="text-sm text-gray-600">
              ניתן להשתמש במשתנים דינמיים: {'{'}{'}'}firstName{'{'}{'}'}, {'{'}{'}'}lastName{'{'}{'}'}, {'{'}{'}'}fullName{'{'}{'}'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            בחר סוג הודעה
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['SMS', 'WHATSAPP', 'VOICE'] as NotificationType[]).map(renderTypeCard)}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            תוכן ההודעה
          </label>
          <textarea
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={defaultMessages[selectedType]}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            ניתן להשתמש במשתנים: {'{'}{'}'}firstName{'{'}{'}'}, {'{'}{'}'}lastName{'{'}{'}'}, {'{'}{'}'}fullName{'{'}{'}'}, {'{'}{'}'}eventName{'{'}{'}'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit" variant="primary" isLoading={isSending}>
            {isSending ? 'שולח...' : 'שלח הודעה'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


