# 🚀 Quick Start Guide - התחלה מהירה

## התקנה מהירה (5 דקות)

### שלב 1: דרישות מקדימות

וודא שיש לך:
- ✅ Node.js 18+ ([הורד כאן](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([הורד כאן](https://www.postgresql.org/download/))
- ✅ Redis 6+ ([הורד כאן](https://redis.io/download))

### שלב 2: שכפול והתקנה

```bash
# שכפל את הפרויקט
git clone <repository-url>
cd "Arrival confirmation system"

# התקן תלויות
npm install
```

### שלב 3: הגדרת בסיס נתונים

```bash
# התחבר ל-PostgreSQL
psql -U postgres

# צור בסיס נתונים
CREATE DATABASE arrival_confirmation;
\q

# הרץ סכמה
psql -U postgres -d arrival_confirmation -f packages/backend/src/infrastructure/database/schema.sql
```

### שלב 4: הגדר משתני סביבה

צור קובץ `.env` בתיקיית `packages/backend/`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=arrival_confirmation
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=my-secret-key-change-in-production

TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

CORS_ORIGIN=http://localhost:3000
```

### שלב 5: הרץ את המערכת

```bash
# הרץ Backend ו-Frontend ביחד
npm run dev
```

או בנפרד:

```bash
# טרמינל 1: Backend
npm run dev:backend

# טרמינל 2: Frontend
npm run dev:frontend
```

### שלב 6: פתח בדפדפן

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 שימוש ראשוני

### 1. התחבר למערכת

פתח http://localhost:3000 ותראה מסך התחברות.

**משתמש דמו:**
- Email: `demo@example.com`
- Password: `demo123`

### 2. צור אירוע ראשון

1. לחץ על "אירוע חדש"
2. מלא פרטים:
   - שם האירוע: "חתונה של דוד ורחל"
   - תאריך: בחר תאריך עתידי
   - אולם: "אולם האירועים הגדול"
   - כתובת: "רחוב הרצל 1, תל אביב"

### 3. הוסף אורחים

**אפשרות 1: ידנית**
1. לחץ "הוסף אורח"
2. מלא פרטים ושמור

**אפשרות 2: ייבוא מאקסל**
1. הורד קובץ דוגמה
2. מלא את הפרטים
3. לחץ "ייבוא מאקסל" והעלה

### 4. שלח הודעות

1. עבור לעמוד "התראות"
2. בחר אורחים
3. בחר סוג הודעה (SMS/WhatsApp/שיחה)
4. לחץ "שלח"

### 5. צפה בסטטיסטיקות

בדשבורד תוכל לראות:
- סה"כ מוזמנים
- כמה אישרו
- כמה סירבו
- כמה ממתינים

## 🐳 הרצה עם Docker (אופציונלי)

אם אתה מעדיף Docker:

```bash
# הרץ הכל עם docker-compose
docker-compose up -d

# צפה בלוגים
docker-compose logs -f

# עצור
docker-compose down
```

## 📱 תכונות עיקריות

### ✅ ניהול אורחים
- הוסף/ערוך/מחק אורחים
- ייבוא המוני מאקסל
- חיפוש וסינון
- מעקב סטטוס (אישר/סירב/ממתין)

### ✅ שליחת הודעות
- 2 SMS אוטומטיים
- 3 הודעות WhatsApp
- 4 שיחות טלפון
- תזכורות אוטומטיות

### ✅ סידורי הושבה
- ניהול שולחנות
- שיוך אורחים לשולחנות
- זיהוי מקומות פנויים
- המלצות אוטומטיות

### ✅ דשבורד זמן אמת
- סטטיסטיקות חיות
- עדכונים בזמן אמת
- גרפים ותרשימים
- היסטוריית הודעות

## 🔧 פתרון בעיות מהיר

### Backend לא עולה?

```bash
# בדוק PostgreSQL
pg_isready

# בדוק Redis
redis-cli ping

# בדוק פורט
lsof -i :5000
```

### Frontend לא נטען?

```bash
# נקה cache
rm -rf node_modules packages/*/node_modules
npm install

# רענן דפדפן
Ctrl + Shift + R
```

### שגיאת חיבור ל-API?

וודא ש:
1. Backend רץ על http://localhost:5000
2. Frontend רץ על http://localhost:3000
3. CORS מוגדר נכון ב-.env

## 📚 למידע נוסף

- 📖 [מדריך התקנה מלא](./INSTALLATION.md)
- 🏗️ [ארכיטקטורה](./ARCHITECTURE.md)
- 📡 [תיעוד API](./API_DOCUMENTATION.md)
- 🚀 [מדריך פריסה](./DEPLOYMENT.md)

## 🆘 צריך עזרה?

- 🐛 [פתח Issue](https://github.com/yourusername/arrival-system/issues)
- 💬 צור קשר עם התמיכה
- 📧 Email: support@yourdomain.com

## 🎉 מוכן לעבודה!

המערכת שלך מוכנה! עכשיו אתה יכול:
1. ✅ ליצור אירועים
2. ✅ לנהל אורחים
3. ✅ לשלוח הודעות
4. ✅ לעקוב אחרי אישורים

**בהצלחה! 🎊**

