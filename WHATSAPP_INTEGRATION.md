# 📱 **מדריך מלא: שילוב WhatsApp API לשליחת הזמנות**

---

## 🎯 **סקירה כללית**

המערכת תומכת כעת בשליחה אוטומטית של הזמנות ב-WhatsApp באמצעות **Twilio WhatsApp API**.

### **מה נוסף?**
✅ **Backend Use Case**: `SendInvitationWhatsAppUseCase`  
✅ **API Endpoint**: `POST /api/v1/invitations/send-whatsapp`  
✅ **Frontend Hook**: `useSendInvitationWhatsApp()`  
✅ **כפתור בממשק**: כפתור ירוק 📱 בדף "אורחים"  
✅ **הודעה אוטומטית**: מעוצבת עם קישור RSVP  
✅ **עדכון מונים**: `whatsappCount` מתעדכן אוטומטית  

---

## 🚀 **איך להשתמש? (למשתמש Admin)**

### **צעד 1: עבור לדף "אורחים"**
```
דשבורד → אירועים → בחר אירוע → אורחים
```

### **צעד 2: מצא את האורח עם מספר טלפון**
⚠️ **הכפתור יהיה אפור (disabled) אם אין מספר טלפון לאורח**

### **צעד 3: לחץ על הכפתור הירוק 📱 (WhatsApp)**
- הכפתור נמצא ליד כפתור "העתק קישור" (סגול)
- יקפוץ חלון אישור: **"האם לשלוח הזמנה ב-WhatsApp ל-[שם האורח]?"**
- לחץ **אישור**

### **צעד 4: המערכת שולחת אוטומטית!**
✨ **ההודעה הנשלחת:**
```
🎊 היי [שם האורח]!

נשמח לראותכם ב[שם האירוע]! 💕

📅 תאריך: [תאריך מעוצב בעברית]
📍 מקום: [שם המקום]
🗺️ כתובת: [כתובת]

🔗 אנא אשרו הגעה דרך הקישור:
http://localhost:3001/invitation/{token}

מחכים לכם! ✨
```

### **צעד 5: בדוק את הסטטוס**
- ✅ הודעת הצלחה תקפוץ: **"הזמנה נשלחה ל-[שם האורח] בהצלחה! 📱✨"**
- 📊 המונה `WA: X/3` בעמודת "אישור הגעה" יתעדכן

---

## ⚙️ **הגדרת Twilio (חובה!)**

### **אופציה 1: Twilio Sandbox (לבדיקות - חינמי)**

#### **1. הירשם ל-Twilio**
```
https://www.twilio.com/try-twilio
```

#### **2. פתח WhatsApp Sandbox**
```
Console → Messaging → Try it out → Send a WhatsApp message
```

#### **3. הוסף מספרים מאומתים**
- שלח הודעה ל-Twilio Sandbox מהמספר שלך:
```
join [code]
```
- הקוד יופיע ב-Sandbox Settings

#### **4. עדכן `.env` בפרויקט**
```env
# Backend: packages/backend/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_FROM=+1234567890
```

⚠️ **הערה**: `TWILIO_WHATSAPP_FROM` חייב להתחיל עם `whatsapp:` prefix!

#### **5. הפעל מחדש את הבקאנד**
```bash
cd packages/backend
npm run dev
```

---

### **אופציה 2: Twilio Production (לייצור - בתשלום)**

#### **1. אימות Business Profile**
```
Console → WhatsApp → Senders → Get started
```

#### **2. רכוש מספר WhatsApp Business**
- עלות: ~$15/חודש + $0.005 להודעה

#### **3. אשר Message Templates**
- צור Template ב-Twilio Console
- המתן לאישור (24-48 שעות)

#### **4. עדכן את הקוד**
אם אתה משתמש ב-Templates, שנה ב-`SendInvitationWhatsAppUseCase.ts`:
```typescript
// במקום sendWhatsApp שולח הודעה רגילה, השתמש ב-Template:
await this.notificationService.sendWhatsApp(
  guest.phone,
  '', // Empty message
  'your_template_name', // Template SID
  [guest.fullName, event.name, invitationUrl] // Template variables
);
```

---

## 🛠️ **פרטים טכניים למפתחים**

### **Backend Flow**

#### **1. Use Case: SendInvitationWhatsAppUseCase**
```typescript
// Path: packages/backend/src/application/use-cases/guest/SendInvitationWhatsAppUseCase.ts

export class SendInvitationWhatsAppUseCase {
  async execute(dto: SendInvitationWhatsAppDto): Promise<{ success: boolean; message: string }> {
    // 1. Validate guest + phone
    // 2. Generate invitation token
    // 3. Build WhatsApp message
    // 4. Send via Twilio
    // 5. Update guest.whatsappCount
    // 6. Update guest.lastContactedAt
  }
}
```

#### **2. API Endpoint**
```
POST /api/v1/invitations/send-whatsapp
Authorization: Bearer {token}
Content-Type: application/json

{
  "guestId": "uuid",
  "eventId": "uuid",
  "customMessage": "optional custom message" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "הזמנה נשלחה ל-משה כהן בהצלחה!"
  }
}
```

#### **3. Route**
```typescript
// Path: packages/backend/src/presentation/routes/guestInvitationRoutes.ts
router.post('/send-whatsapp', authMiddleware, controller.sendInvitationWhatsApp);
```

---

### **Frontend Flow**

#### **1. API Client**
```typescript
// Path: packages/frontend/src/infrastructure/api/invitationApi.ts

export const invitationApi = {
  async sendInvitationWhatsApp(
    guestId: string,
    eventId: string,
    customMessage?: string
  ): Promise<{ success: boolean; message: string }> {
    // POST to backend
  }
};
```

#### **2. React Hook**
```typescript
// Path: packages/frontend/src/application/hooks/useInvitation.ts

export const useSendInvitationWhatsApp = () => {
  return useMutation({
    mutationFn: async ({ guestId, eventId, customMessage }) => {
      return invitationApi.sendInvitationWhatsApp(guestId, eventId, customMessage);
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(errorMessage);
    },
  });
};
```

#### **3. UI Component**
```typescript
// Path: packages/frontend/src/presentation/pages/GuestsPage.tsx

const sendWhatsAppMutation = useSendInvitationWhatsApp();

const handleSendWhatsApp = async (guest: Guest) => {
  if (!guest.phone) {
    toast.error('אין מספר טלפון');
    return;
  }
  
  const confirmed = confirm(`שלח ל-${guest.firstName}?`);
  if (!confirmed) return;
  
  sendWhatsAppMutation.mutate({
    guestId: guest.id,
    eventId: eventId!,
  });
};
```

---

## 🎨 **מיקום הכפתור ב-UI**

### **בדף "אורחים" - כפתורי פעולה לכל אורח:**

| אייקון | צבע | פעולה | Condition |
|--------|-----|--------|-----------|
| ✅ CheckCircle | ירוק | אשר הגעה | רק אם `status=PENDING` |
| 🔗 Link2 | סגול | **העתק קישור** | תמיד |
| 📱 MessageSquare | **ירוק** | **שלח ב-WhatsApp** ← **החדש!** | רק אם יש `phone` |
| 📤 Send | כחול | שלח הודעה | תמיד |
| ✏️ Edit | אפור | ערוך | תמיד |
| 🗑️ Trash2 | אדום | מחק | תמיד |

---

## 🧪 **בדיקות**

### **בדיקה מהירה - דרך Frontend:**
1. הפעל Backend: `cd packages/backend && npm run dev`
2. הפעל Frontend: `cd packages/frontend && npm run dev`
3. התחבר כ-Admin
4. עבור לדף "אורחים"
5. בחר אורח עם מספר טלפון
6. לחץ על הכפתור הירוק 📱
7. אשר את החלון
8. ✅ בדוק:
   - הודעת Toast: "הזמנה נשלחה בהצלחה"
   - ב-Twilio Console → Monitor → Logs → ההודעה צריכה להופיע
   - המונה `WA: X/3` עלה ב-1

### **בדיקה ידנית - דרך Postman:**
```http
POST http://localhost:5000/api/v1/invitations/send-whatsapp
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "guestId": "7c123456-1234-1234-1234-123456789abc",
  "eventId": "7eb80abb-8f88-4953-9b82-12425b05d039",
  "customMessage": "היי! בוא לחתונה שלי! 🎉"
}
```

---

## 🚨 **Troubleshooting**

### **שגיאה: "Guest does not have a phone number"**
✅ **פתרון**: הוסף מספר טלפון לאורח:
1. דף "אורחים" → לחץ על "ערוך" (✏️)
2. הוסף מספר בפורמט: `+972501234567`
3. שמור

---

### **שגיאה: "Failed to send WhatsApp: Invalid 'To' Phone Number"**
✅ **פתרון**: 
- **Twilio Sandbox**: המספר חייב להיות מאומת (Join Sandbox)
- **Format**: חייב להיות בפורמט בינלאומי: `+972501234567`
- בדוק ב-Twilio Console → WhatsApp → Sandbox → Verified numbers

---

### **שגיאה: "Account not authorized to use WhatsApp"**
✅ **פתרון**: 
1. הפעל WhatsApp Sandbox ב-Twilio Console
2. או: רכוש Twilio WhatsApp Business Number

---

### **ההודעה נשלחה אבל לא הגיעה**
✅ **בדיקות**:
1. **Twilio Console → Monitor → Logs**:
   - סטטוס `queued` = נשלח
   - סטטוס `sent` = הגיע לשרת WhatsApp
   - סטטוס `delivered` = הגיע לאורח
   - סטטוס `failed` = כשלון - ראה Error Code

2. **בדוק Format של המספר**:
   - חייב להתחיל ב-`+` (country code)
   - דוגמה ישראל: `+972501234567`
   - **לא** `0501234567` ❌

3. **בדוק Sandbox Join**:
   - האורח שלח `join {code}` למספר Twilio?

---

### **Demo Mode (ללא Twilio)**
אם אין Twilio credentials, המערכת תעבוד ב-**Demo Mode**:
- לא תשלח הודעות אמיתיות
- רק תדפיס ל-console
- המונים יתעדכנו כרגיל

**איך לבדוק?**
```bash
# אם אין TWILIO_ env vars, תראה:
🟡 Twilio credentials not provided, using demo mode
📱 [DEMO] Would send WhatsApp to +972501234567: היי משה!...
```

---

## 🎁 **פיצ'רים נוספים (עתידיים)**

### **1. הודעה מותאמת אישית**
במקום ההודעה האוטומטית, תוכל לשלוח הודעה custom:
```typescript
sendWhatsAppMutation.mutate({
  guestId: guest.id,
  eventId: eventId!,
  customMessage: "היי! בוא לחתונה שלי ב-15:00! 🎉"
});
```

### **2. שליחה המונית**
```typescript
// TODO: Implement bulk send
const handleSendToAll = async () => {
  const guestsWithPhone = guests.filter(g => g.phone);
  
  for (const guest of guestsWithPhone) {
    await sendWhatsAppMutation.mutateAsync({
      guestId: guest.id,
      eventId: eventId!,
    });
    
    // Wait 1 second between messages (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  toast.success(`נשלחו ${guestsWithPhone.length} הזמנות!`);
};
```

### **3. QR Code**
במקום קישור, שליחת QR code:
```typescript
import QRCode from 'qrcode';

const qrCodeUrl = await QRCode.toDataURL(invitationUrl);
// שלח את ה-QR כתמונה ב-WhatsApp
```

### **4. תזמון שליחה**
```typescript
// TODO: Schedule messages
scheduleWhatsApp(guest.id, eventId, new Date('2025-01-01 09:00'));
```

---

## 📚 **משאבים נוספים**

### **Twilio Docs:**
- [WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [Message Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

### **קבצים רלוונטיים בפרויקט:**
```
Backend:
├── src/application/use-cases/guest/SendInvitationWhatsAppUseCase.ts
├── src/presentation/controllers/GuestInvitationController.ts
├── src/presentation/routes/guestInvitationRoutes.ts
└── src/index.ts

Frontend:
├── src/application/hooks/useInvitation.ts
├── src/infrastructure/api/invitationApi.ts
└── src/presentation/pages/GuestsPage.tsx
```

---

## ✅ **סיכום**

| תכונה | סטטוס |
|-------|--------|
| 📱 שליחת WhatsApp אוטומטית | ✅ מוכן |
| 🔗 קישור הזמנה ייחודי | ✅ מוכן |
| 📊 עדכון מונים | ✅ מוכן |
| 🎨 כפתור בממשק | ✅ מוכן |
| ⚠️ ולידציה | ✅ מוכן |
| 🎉 Toast הודעות | ✅ מוכן |
| 🔒 Twilio Integration | ✅ מוכן |
| 🧪 Demo Mode | ✅ מוכן |

---

**🎊 המערכת מוכנה! תתחיל לשלוח הזמנות! 🎊**

לשאלות או בעיות, בדוק את ה-logs:
```bash
# Backend logs
cd packages/backend
npm run dev

# Frontend logs  
cd packages/frontend
npm run dev
```

**Happy Messaging! 📱✨**

