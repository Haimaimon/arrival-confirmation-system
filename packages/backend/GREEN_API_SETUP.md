# 🟢 Green API Setup Guide - WhatsApp Integration

## 📌 מה זה Green API?

Green API הוא שירות המאפשר שליחת הודעות WhatsApp דרך REST API. השירות מציע תוכנית חינמית עם מספר מוגבל של הודעות ליום.

---

## 🚀 הגדרת Green API - שלב אחר שלב

### **שלב 1: הרשמה לשירות**

1. **היכנס לאתר:**
   ```
   https://green-api.com
   ```

2. **הירשם/התחבר:**
   - לחץ על "Sign Up" / "הרשמה"
   - מלא את הפרטים שלך
   - אשר את כתובת האימייל

3. **צור Instance חדש:**
   - לחץ על "Create Instance"
   - תקבל **Instance ID** ו-**API Token**
   - שמור אותם בצד!

---

### **שלב 2: חיבור WhatsApp**

1. **קישור מכשיר WhatsApp:**
   - בממשק Green API לחץ על "Link Device"
   - יופיע לך QR Code

2. **סרוק את ה-QR Code:**
   - פתח את WhatsApp במכשיר שלך
   - הגדרות → Linked Devices → Link a Device
   - סרוק את ה-QR Code

3. **אישור:**
   - המכשיר שלך מחובר!
   - עכשיו אפשר לשלוח הודעות דרך ה-API

---

### **שלב 3: הוספת Credentials למערכת**

1. **פתח את הקובץ `.env`** בתיקיית `packages/backend/`

2. **הוסף את השורות הבאות:**
   ```env
   # Green API Configuration (for WhatsApp)
   GREEN_API_INSTANCE_ID=your_instance_id_here
   GREEN_API_TOKEN=your_api_token_here
   ```

3. **החלף את הערכים:**
   - `your_instance_id_here` → ה-Instance ID שקיבלת
   - `your_api_token_here` → ה-API Token שקיבלת

4. **דוגמה אמיתית:**
   ```env
   GREEN_API_INSTANCE_ID=1234567890
   GREEN_API_TOKEN=abcdef123456ghijkl7890mnopqrs
   ```

---

### **שלב 4: אתחול מחדש של השרת**

1. **עצור את השרת (אם הוא רץ):**
   ```bash
   Ctrl+C
   ```

2. **הפעל מחדש:**
   ```bash
   npm run dev
   # או
   cd packages/backend && npm run dev
   ```

3. **חפש בלוג:**
   ```
   ✅ Green API configured successfully
   ```

   אם אתה רואה את זה - הכל עובד!

   אם אתה רואה:
   ```
   ⚠️  Green API not configured - running in DEMO mode
   ```
   זה אומר ש-Credentials לא מוגדרים נכון.

---

## 🧪 בדיקה (Test)

### **בדיקה מתוך המערכת:**

1. **היכנס למערכת:**
   ```
   http://localhost:3001
   ```

2. **עבור לדף "אורחים"**

3. **בחר אורח עם מספר טלפון**

4. **לחץ על הכפתור הירוק** (💬 MessageSquare icon)
   - יופיע אישור: "האם לשלוח הזמנה ב-WhatsApp...?"
   - לחץ "אישור"

5. **בדוק את WhatsApp:**
   - ההודעה אמורה להישלח תוך מספר שניות
   - תראה הודעה עם קישור ההזמנה וטקסט מעוצב

---

### **בדיקה ב-Postman / API:**

```http
POST http://localhost:5000/api/v1/invitations/send-whatsapp
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "guestId": "guest-uuid-here",
  "eventId": "event-uuid-here"
}
```

**תשובה מוצלחת:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "הקישור נשלח ל-שם אורח בהצלחה! 🎊",
    "messageId": "ABC123XYZ"
  }
}
```

---

## 🎭 Demo Mode (מצב בדיקה)

אם אין לך Green API credentials, המערכת רצה ב-**Demo Mode**:

- ההודעות לא נשלחות באמת
- ההודעות מודפסות ב-Console
- שימושי לפיתוח ובדיקות

**בלוג תראה:**
```
🎭 DEMO MODE - WhatsApp message:
📱 To: +972501234567
💬 Message: שלום משה!
אנחנו שמחים להזמין אתכם...
──────────────────────────────────────────────────
```

---

## 📊 פורמט ההודעה שנשלחת

```
🎊 *שלום [שם האורח]!*

אנחנו שמחים להזמין אתכם לאירוע שלנו! 💕

🔗 *לאישור הגעה לחצו כאן:*
http://localhost:3001/invitation/eyJhbGci...

נשמח לראותכם! ✨

_הודעה זו נשלחה דרך מערכת אישור הגעה דיגיטלית_
```

---

## 🔧 Troubleshooting

### **שגיאה: "Failed to send WhatsApp"**

**גורמים אפשריים:**
1. ה-Instance ID או Token שגויים
2. ה-WhatsApp לא מחובר (QR Code פג)
3. מספר הטלפון בפורמט לא נכון
4. חרגת מהמכסה היומית

**פתרון:**
- בדוק שה-credentials נכונים ב-`.env`
- היכנס ל-Green API ובדוק שה-Instance פעיל
- חבר מחדש את WhatsApp (סרוק QR code שוב)

---

### **שגיאה: "Guest does not have a phone number"**

**פתרון:**
- האורח חייב לכלול מספר טלפון
- ודא שמספר הטלפון בפורמט ישראלי תקין:
  - `0501234567`
  - `+972501234567`
  - `972501234567`

---

### **ההודעה נשלחת אבל לא מגיעה**

**בדיקות:**
1. ודא שה-WhatsApp מחובר ב-Green API Dashboard
2. בדוק שמספר הטלפון נכון
3. בדוק ב-Green API logs אם ההודעה נשלחה בהצלחה

---

## 💰 מחירים ומגבלות

### **תוכנית חינמית:**
- 💰 **מחיר:** חינם!
- 📨 **מספר הודעות:** עד 100 הודעות ליום
- ⏱️ **תוקף:** ללא הגבלה

### **תוכניות בתשלום:**
- אפשרות לשדרוג למספר הודעות גבוה יותר
- פיצ'רים נוספים (תמונות, קבצים, וכו')

---

## 🎯 שימוש במערכת

### **שליחה יזנית (מדף אורחים):**
1. לחץ על כפתור WhatsApp הירוק (💬)
2. אשר את השליחה
3. ההודעה תישלח אוטומטית עם קישור מותאם אישית

### **שליחה מרובה (עתידי):**
בגרסאות הבאות נוסיף:
- שליחה ל-**כל האורחים** בבת אחת
- שליחה **מסוננת** (רק למוזמנים מסוימים)
- **תזמון שליחה** (לדוגמה, שבוע לפני האירוע)

---

## 📞 תמיכה

אם יש בעיות עם Green API:
- **אתר:** https://green-api.com
- **דוקומנטציה:** https://green-api.com/en/docs/
- **תמיכה:** support@green-api.com

---

## ✅ סיכום

1. ✅ הרשם ל-Green API
2. ✅ צור Instance וקבל Credentials
3. ✅ חבר WhatsApp דרך QR Code
4. ✅ הוסף Credentials ל-`.env`
5. ✅ אתחל מחדש את השרת
6. ✅ בדוק ששליחת הודעות עובדת!

**המערכת מוכנה! 🚀**

