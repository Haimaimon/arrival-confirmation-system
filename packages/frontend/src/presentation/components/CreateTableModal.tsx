/**
 * Presentation Layer - Create Table Modal
 * Beautiful modal for creating a new table
 */

import { FC, useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Hash, Users, MapPin, FileText } from 'lucide-react';
import { useCreateTable } from '../../application/hooks/useTables';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

interface FormData {
  tableNumber: string;
  capacity: string;
  section: string;
  notes: string;
}

export const CreateTableModal: FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const [formData, setFormData] = useState<FormData>({
    tableNumber: '',
    capacity: '10',
    section: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const createMutation = useCreateTable();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.tableNumber.trim()) {
      newErrors.tableNumber = 'מספר שולחן הוא שדה חובה';
    } else if (isNaN(Number(formData.tableNumber)) || Number(formData.tableNumber) < 1) {
      newErrors.tableNumber = 'מספר שולחן חייב להיות מספר חיובי';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'קיבולת היא שדה חובה';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1) {
      newErrors.capacity = 'קיבולת חייבת להיות לפחות 1';
    } else if (Number(formData.capacity) > 24) {
      newErrors.capacity = 'קיבולת מקסימלית היא 24 מקומות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    createMutation.mutate(
      {
        eventId,
        tableNumber: Number(formData.tableNumber),
        capacity: Number(formData.capacity),
        section: formData.section.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: '10',
      section: '',
      notes: '',
    });
    setErrors({});
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        onClose();
        resetForm();
      }} 
      title="➕ הוסף שולחן חדש" 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Table Number & Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Table Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מספר שולחן <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleInputChange}
                className={`w-full pr-10 pl-4 py-3 border ${
                  errors.tableNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="1"
                min="1"
              />
            </div>
            {errors.tableNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.tableNumber}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קיבולת (מקומות) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className={`w-full pr-10 pl-4 py-3 border ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="10"
                min="1"
                max="24"
              />
            </div>
            {errors.capacity && (
              <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            מיקום/אזור (אופציונלי)
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder='לדוגמה: "מרכז", "ימין", "שמאל"'
            />
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
            placeholder="הערות נוספות על השולחן..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            ביטול
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'יוצר...' : '✓ צור שולחן'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

