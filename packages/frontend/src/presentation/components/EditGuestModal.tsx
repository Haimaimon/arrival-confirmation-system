/**
 * Presentation Layer - Edit Guest Modal
 * Beautiful modal for editing an existing guest with validation
 */

import { FC, useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Guest } from '../../domain/entities/Guest';
import { User, Phone, Mail, Users, FileText, Heart } from 'lucide-react';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onSave: (guestId: string, data: Partial<Guest>) => void;
  isSaving?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  type: string;
  numberOfGuests: number;
  notes: string;
}

export const EditGuestModal: FC<EditGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    type: 'MUTUAL',
    numberOfGuests: 1,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Load guest data when modal opens
  useEffect(() => {
    if (guest && isOpen) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        phone: guest.phone || '', // Handle undefined/null phone
        email: guest.email || '',
        type: guest.type,
        numberOfGuests: guest.numberOfGuests,
        notes: guest.notes || '',
      });
      setErrors({});
    }
  }, [guest, isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שם פרטי הוא שדה חובה';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שם משפחה הוא שדה חובה';
    }

    // Phone is optional, but if provided, must be valid
    if (formData.phone && formData.phone.trim() !== '') {
      if (!/^0\d{1,2}-?\d{7}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'מספר טלפון לא תקין';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'מספר מוזמנים חייב להיות לפחות 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate() || !guest) {
      return;
    }

    onSave(guest.id, {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim() || undefined, // Send undefined if empty
      email: formData.email.trim() || undefined,
      type: formData.type,
      numberOfGuests: Number(formData.numberOfGuests),
      notes: formData.notes.trim() || undefined,
    } as Partial<Guest>);
  };

  if (!guest) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ ערוך אורח" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            פרטים אישיים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם פרטי <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם משפחה <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            פרטי התקשרות
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טלפון (אופציונלי)
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pr-10 pl-4 py-3 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                  dir="ltr"
                  placeholder="050-1234567"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אימייל (אופציונלי)
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pr-10 pl-4 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            פרטי אירוע
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type (Side) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                צד
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="MUTUAL">💑 משותף</option>
                <option value="GROOM">👔 חתן</option>
                <option value="BRIDE">👰 כלה</option>
              </select>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מספר מוזמנים <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full pr-10 pl-4 py-3 border ${
                    errors.numberOfGuests ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
              </div>
              {errors.numberOfGuests && (
                <p className="text-red-500 text-xs mt-1">{errors.numberOfGuests}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            הערות (אופציונלי)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="הערות נוספות על האורח..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'שומר...' : '✓ שמור שינויים'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

