/**
 * Presentation Layer - Edit Table Modal
 * Modal for editing an existing table
 */

import { FC, useState, useEffect, FormEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Hash, Users, MapPin, FileText } from 'lucide-react';
import { useUpdateTable } from '../../application/hooks/useTables';
import { TableWithStats } from '../../domain/entities/Table';

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithStats;
}

interface FormData {
  tableNumber: string;
  capacity: string;
  section: string;
  notes: string;
}

export const EditTableModal: FC<EditTableModalProps> = ({
  isOpen,
  onClose,
  table,
}) => {
  const [formData, setFormData] = useState<FormData>({
    tableNumber: '',
    capacity: '',
    section: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const updateMutation = useUpdateTable();

  // Load table data when modal opens
  useEffect(() => {
    if (table && isOpen) {
      setFormData({
        tableNumber: table.tableNumber.toString(),
        capacity: table.capacity.toString(),
        section: table.section || '',
        notes: table.notes || '',
      });
      setErrors({});
    }
  }, [table, isOpen]);

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

    // Check if capacity is less than occupied seats
    if (Number(formData.capacity) < table.occupiedSeats) {
      newErrors.capacity = `קיבולת לא יכולה להיות פחות ממספר האורחים הקיימים (${table.occupiedSeats})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    updateMutation.mutate(
      {
        id: table.id,
        data: {
          tableNumber: Number(formData.tableNumber),
          capacity: Number(formData.capacity),
          section: formData.section.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="✏️ ערוך שולחן" 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Status */}
        {table.occupiedSeats > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium">
                בשולחן זה יושבים כרגע {table.occupiedSeats} אורחים
              </p>
            </div>
          </div>
        )}

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
                min={table.occupiedSeats}
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
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'שומר...' : '✓ שמור שינויים'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

