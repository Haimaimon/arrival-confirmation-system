/**
 * Infrastructure Layer - Excel Template Generator
 * Creates the guest import template in the correct Hebrew format
 */

import * as XLSX from 'xlsx';

export function generateGuestImportTemplate(): Buffer {
  // Create headers in Hebrew as per the requested format
  const headers = [
    'שורה',                    // Row number
    'מס\' אורחים שהוזמנו',     // Number of guests invited
    'צד',                      // Side (חתן/כלה/משותף)
    'קבוצה',                   // Group
    'סולרי',                   // Solari (optional)
    'טלפון רגיל',              // Phone
    'אימייל',                  // Email
    'עיר',                     // City
    'רחוב',                    // Street
    'כתובת',                   // Address
    'פרטי התקשרות',            // Contact details
    'מיקוד',                   // Postal code
    'תא דואר',                 // PO Box
    'צ\'ק צפוי',               // Expected check
    'הזמנה לכבוד',             // Name (REQUIRED!)
  ];

  // Create sample data rows
  const sampleData = [
    [
      1,                        // שורה
      2,                        // מס' אורחים
      'חתן',                    // צד
      'משפחה',                  // קבוצה
      '',                       // סולרי
      '050-1234567',            // טלפון
      'example@email.com',      // אימייל
      'תל אביב',                // עיר
      'רחוב הרצל 1',            // רחוב
      'רחוב הרצל 1, תל אביב',   // כתובת
      '050-1234567',            // פרטי התקשרות
      '12345',                  // מיקוד
      '',                       // תא דואר
      '',                       // צ'ק צפוי
      'דוד כהן',                // הזמנה לכבוד (חובה!)
    ],
    [
      2,
      3,
      'כלה',
      'חברים',
      '',
      '052-9876543',
      '',
      'ירושלים',
      '',
      '',
      '052-9876543',
      '',
      '',
      '',
      'שרה לוי',                // הזמנה לכבוד (חובה!)
    ],
    [
      3,
      1,
      'משותף',
      'עבודה',
      '',
      '054-5555555',
      'test@example.com',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'יוסי ישראלי',            // הזמנה לכבוד (חובה!)
    ],
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },   // שורה
    { wch: 20 },  // מס' אורחים שהוזמנו
    { wch: 12 },  // צד
    { wch: 15 },  // קבוצה
    { wch: 12 },  // סולרי
    { wch: 15 },  // טלפון רגיל
    { wch: 25 },  // אימייל
    { wch: 15 },  // עיר
    { wch: 20 },  // רחוב
    { wch: 30 },  // כתובת
    { wch: 20 },  // פרטי התקשרות
    { wch: 12 },  // מיקוד
    { wch: 12 },  // תא דואר
    { wch: 12 },  // צ'ק צפוי
    { wch: 25 },  // הזמנה לכבוד
  ];

  // Style the header row (make it bold with background color)
  const headerCellStyle = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Apply header styling (columns A-O, row 1)
  for (let col = 0; col < headers.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerCellStyle;
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'אורחים');

  // Write to buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return excelBuffer;
}

