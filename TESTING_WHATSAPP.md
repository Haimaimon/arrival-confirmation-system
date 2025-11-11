# 📱 מדריך בדיקת WhatsApp

## 🎯 3 דרכים לבדוק WhatsApp

---

## 1️⃣ דרך מהירה - דף בדיקה (מומלץ!)

### שלבים:

1. **הפעל את הבקאנד והפרונטאנד**:
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend  
cd packages/frontend
npm run dev
```

2. **כנס למערכת**:
- פתח דפדפן: `http://localhost:3001`
- התחבר עם המשתמש שלך

3. **גש לדף הבדיקה**:
- כתובת ישירה: `http://localhost:3001/test/whatsapp`
- או הוסף `/test/whatsapp` לכתובת הבסיס

4. **שלח הודעה**:
- הכנס מספר WhatsApp בפורמט בינלאומי: `+972501234567`
- כתוב הודעה: "שלום! בדיקת אישור הגעה ✨"
- לחץ "שלח הודעת WhatsApp"

---

## 2️⃣ דרך מהירה - סקריפט Node.js

### שלבים:

1. **וודא ש-Twilio מוגדר ב-.env**:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

2. **הרץ את הסקריפט**:
```bash
cd packages/backend
node test-whatsapp.js +972501234567 "הודעת בדיקה"
```

**דוגמאות**:
```bash
# With custom phone and message
node test-whatsapp.js +972501234567 "שלום עולם"

# With default message
node test-whatsapp.js +972501234567

# With all defaults (will use +972501234567)
node test-whatsapp.js
```

---

## 3️⃣ דרך מתקדמת - API ישירות

### שלבים:

1. **קבל Token**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

2. **שלח WhatsApp**:
```bash
curl -X POST http://localhost:5000/api/v1/test/whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "to": "+972501234567",
    "message": "שלום! בדיקת אישור הגעה ✨"
  }'
```

---

## 🔧 Troubleshooting

### ❌ שגיאה: "The number is unverified"

**פתרון**:
1. לך ל-[Twilio Verified Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. לחץ על "Add a new Caller ID"
3. הכנס את המספר והשלם את האימות

---

### ❌ שגיאה: "Unable to create record"

**פתרון**:
1. וודא שהצטרפת ל-Twilio WhatsApp Sandbox
2. שלח הודעה ל-`+1 415 523 8886` עם הטקסט: `join whom-fine`
3. המתן לאישור
4. נסה שוב

---

### ❌ שגיאה: "Account SID is missing"

**פתרון**:
1. וודא שקובץ `.env` קיים ב-`packages/backend/`
2. בדוק שיש את השדות:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```
3. הפעל מחדש את הבקאנד

---

### ✅ איך לדעת שזה עובד?

**סימנים טובים**:
- ✅ התגובה מכילה `"success": true`
- ✅ יש `messageId` בתגובה
- ✅ Status הוא `queued` או `sent`
- ✅ קיבלת הודעה ב-WhatsApp!

**דוגמה לתגובה מוצלחת**:
```json
{
  "success": true,
  "data": {
    "messageId": "SM1234567890abcdef",
    "status": "queued",
    "success": true
  }
}
```

---

## 📚 קישורים שימושיים

- [Twilio Console](https://console.twilio.com)
- [Verify Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
- [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
- [Twilio Logs](https://console.twilio.com/us1/monitor/logs/messages)

---

## 🎉 זהו! תהנה מהבדיקות!

אם יש בעיות נוספות, בדוק את הלוגים:
- **Frontend**: פתח Console (F12)
- **Backend**: הסתכל בטרמינל שבו רץ הבקאנד

