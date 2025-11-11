/**
 * Presentation Layer - Create Event Modal Component
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { EventType } from '../../domain/entities/Event';
import { useEvents } from '../../application/hooks/useEvents';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, isCreating } = useEvents();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    type: EventType.WEDDING,
    eventDate: '',
    eventTime: '',
    // Step 2: Venue
    venueName: '',
    venueAddress: '',
    venueCity: '',
    googleMapsUrl: '',
    // Step 3: Settings
    seatsPerTable: 10,
    maxTables: 50,
    enableSms: true,
    enableWhatsApp: true,
    enablePhoneCalls: true,
    enableMorningReminder: true,
    enableEveningReminder: true,
    enableThankYouMessage: true,
    enableGiftRegistry: false,
    giftRegistryUrl: '',
  });

  const eventTypeOptions = [
    { value: EventType.WEDDING, label: 'חתונה', icon: '💑' },
    { value: EventType.BAR_MITZVAH, label: 'בר מצווה', icon: '🎉' },
    { value: EventType.BAT_MITZVAH, label: 'בת מצווה', icon: '🎀' },
    { value: EventType.BIRTHDAY, label: 'יום הולדת', icon: '🎂' },
    { value: EventType.CORPORATE, label: 'אירוע עסקי', icon: '💼' },
    { value: EventType.OTHER, label: 'אחר', icon: '🎊' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and time into ISO format
      const eventDateTime = `${formData.eventDate}T${formData.eventTime}:00`;
      const dateObj = new Date(eventDateTime);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        alert('תאריך או שעה לא תקינים');
        return;
      }

      const eventData = {
        name: formData.name,
        type: formData.type,
        eventDate: dateObj.toISOString(),
        venue: {
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.venueCity,
          googleMapsUrl: formData.googleMapsUrl || undefined,
        },
        settings: {
          seatsPerTable: formData.seatsPerTable,
          maxTables: formData.maxTables,
          enableSms: formData.enableSms,
          enableWhatsApp: formData.enableWhatsApp,
          enablePhoneCalls: formData.enablePhoneCalls,
          enableMorningReminder: formData.enableMorningReminder,
          enableEveningReminder: formData.enableEveningReminder,
          enableThankYouMessage: formData.enableThankYouMessage,
          enableGiftRegistry: formData.enableGiftRegistry,
          giftRegistryUrl: formData.enableGiftRegistry ? formData.giftRegistryUrl : undefined,
        },
      };

      createEvent(eventData, {
        onSuccess: () => {
          onClose();
          resetForm();
        },
        onError: (error: any) => {
          const errorMsg = error.response?.data?.error || error.message;
          alert(`שגיאה: ${errorMsg}`);
        },
      });
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      type: EventType.WEDDING,
      eventDate: '',
      eventTime: '',
      venueName: '',
      venueAddress: '',
      venueCity: '',
      googleMapsUrl: '',
      seatsPerTable: 10,
      maxTables: 50,
      enableSms: true,
      enableWhatsApp: true,
      enablePhoneCalls: true,
      enableMorningReminder: true,
      enableEveningReminder: true,
      enableThankYouMessage: true,
      enableGiftRegistry: false,
      giftRegistryUrl: '',
    });
  };

  const nextStep = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.eventDate && formData.eventTime;
      case 2:
        return formData.venueName && formData.venueAddress && formData.venueCity;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="צור אירוע חדש" size="large">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting the form unless on step 3
          if (e.key === 'Enter' && step < 3) {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[
              { num: 1, label: 'פרטי אירוע' },
              { num: 2, label: 'מקום האירוע' },
              { num: 3, label: 'הגדרות' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      s.num === step
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : s.num < step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.num < step ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      s.num === step ? 'text-blue-600' : s.num < step ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-20 h-1 mx-3 mt-[-20px] ${s.num < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            שלב {step} מתוך 3
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">פרטי אירוע בסיסיים</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שם האירוע</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="לדוגמה: חתונה של דוד ורחל"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג האירוע</label>
              <div className="grid grid-cols-2 gap-3">
                {eventTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: option.value }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תאריך האירוע</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שעת האירוע</label>
                <input
                  type="time"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Venue Info */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">פרטי מקום האירוע</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שם האולם</label>
              <input
                type="text"
                name="venueName"
                value={formData.venueName}
                onChange={handleInputChange}
                placeholder="לדוגמה: אולמי בית הלל"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כתובת</label>
              <input
                type="text"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleInputChange}
                placeholder="לדוגמה: רחוב הרצל 123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">עיר</label>
              <input
                type="text"
                name="venueCity"
                value={formData.venueCity}
                onChange={handleInputChange}
                placeholder="לדוגמה: תל אביב"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קישור Google Maps (אופציונלי)</label>
              <input
                type="url"
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">הגדרות אירוע</h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-800">סידורי הושבה</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מקומות לשולחן</label>
                  <input
                    type="number"
                    name="seatsPerTable"
                    value={formData.seatsPerTable}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מקסימום שולחנות</label>
                  <input
                    type="number"
                    name="maxTables"
                    value={formData.maxTables}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-800 mb-3">אישורי הגעה</h4>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableSms"
                  checked={formData.enableSms}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">📱 הודעות SMS</span>
              </label>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableWhatsApp"
                  checked={formData.enableWhatsApp}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">💬 הודעות WhatsApp</span>
              </label>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enablePhoneCalls"
                  checked={formData.enablePhoneCalls}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">📞 שיחות טלפון</span>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-800 mb-3">תזכורות</h4>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableMorningReminder"
                  checked={formData.enableMorningReminder}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">🌅 תזכורת בוקר</span>
              </label>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableEveningReminder"
                  checked={formData.enableEveningReminder}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">🌆 תזכורת ערב</span>
              </label>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableThankYouMessage"
                  checked={formData.enableThankYouMessage}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">💝 הודעת תודה</span>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  name="enableGiftRegistry"
                  checked={formData.enableGiftRegistry}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">🎁 מתנות באשראי</span>
              </label>
              {formData.enableGiftRegistry && (
                <input
                  type="url"
                  name="giftRegistryUrl"
                  value={formData.giftRegistryUrl}
                  onChange={handleInputChange}
                  placeholder="קישור למתנות באשראי"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={prevStep}>
                ← הקודם
              </Button>
            )}
          </div>
          <div className="flex space-x-3 space-x-reverse">
            <Button type="button" variant="secondary" onClick={onClose}>
              ביטול
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
                disabled={!isStepValid()}
              >
                הבא →
              </Button>
            ) : (
              <Button type="submit" disabled={isCreating || !isStepValid()}>
                {isCreating ? 'יוצר אירוע...' : '✓ צור אירוע'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

