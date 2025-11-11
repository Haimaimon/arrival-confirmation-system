/**
 * Presentation Layer - Import Excel Modal
 * Beautiful drag-and-drop modal for importing guests from Excel
 */

import { FC, useState, useRef, DragEvent } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useImportGuests } from '../../application/hooks/useGuests';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export const ImportExcelModal: FC<ImportExcelModalProps> = ({ isOpen, onClose, eventId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: importGuests, isPending, data: importResult } = useImportGuests();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('יש לבחור קובץ Excel בלבד (.xlsx או .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות פחות מ-10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;

    importGuests(
      { eventId, file: selectedFile },
      {
        onSuccess: () => {
          // Modal will close automatically after success toast from hook
          setTimeout(() => {
            handleClose();
          }, 1500);
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragging(false);
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/guests/template/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'תבנית-ייבוא-אורחים.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('תבנית Excel הורדה בהצלחה! 📥');
    } catch (error) {
      toast.error('שגיאה בהורדת התבנית');
      console.error('Error downloading template:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📊 ייבוא אורחים מאקסל" size="lg">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            איך זה עובד?
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 mr-5">
            <li className="list-decimal">הורד את תבנית Excel או השתמש בקובץ קיים</li>
            <li className="list-decimal">מלא את פרטי האורחים בקובץ</li>
            <li className="list-decimal">גרור את הקובץ לכאן או לחץ לבחירה</li>
            <li className="list-decimal">לחץ על "ייבא אורחים" וסיימת! 🎉</li>
          </ol>
        </div>

        {/* Template Format */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3">📋 עמודות בתבנית:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-purple-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">הזמנה לכבוד</span> (חובה!)
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>מס׳ אורחים שהוזמנו</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>צד</span> (חתן/כלה/משותף)
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>קבוצה</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>טלפון רגיל</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>אימייל</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>עיר, רחוב, כתובת</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>מיקוד, ת.ד</span>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
            onClick={handleDownloadTemplate}
            className="mt-4"
            size="sm"
          >
            הורד תבנית Excel
          </Button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedFile ? (
            // File Selected State
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <FileSpreadsheet className="h-20 w-20 text-green-600" />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-1">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFile(null)}
                icon={<X className="h-4 w-4" />}
              >
                הסר קובץ
              </Button>
            </div>
          ) : (
            // Default State
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={`
                  relative transition-transform duration-300
                  ${isDragging ? 'scale-110' : ''}
                `}>
                  <Upload className={`h-16 w-16 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-20 w-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragging ? '🎯 שחרר את הקובץ כאן!' : 'גרור קובץ Excel לכאן'}
                </p>
                <p className="text-sm text-gray-500 mb-4">או לחץ לבחירת קובץ</p>
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<FileSpreadsheet className="h-5 w-5" />}
                >
                  בחר קובץ Excel
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                קבצים נתמכים: .xlsx, .xls (עד 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Import Results (if available) */}
        {importResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h4 className="font-semibold text-gray-900 mb-3">📊 תוצאות ייבוא:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">הצליחו</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{importResult.successCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">נכשלו</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{importResult.failureCount}</p>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">שגיאות:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>
                      שורה {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {importResult ? 'סגור' : 'ביטול'}
          </Button>
          {!importResult && (
            <Button
              type="button"
              variant="primary"
              onClick={handleImport}
              disabled={!selectedFile || isPending}
              icon={<Upload className="h-5 w-5" />}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  מייבא אורחים...
                </span>
              ) : (
                '📊 ייבא אורחים'
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

