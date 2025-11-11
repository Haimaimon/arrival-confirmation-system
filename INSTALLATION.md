# 📦 הוראות התקנה - מערכת אישורי הגעה

## דרישות מקדימות

לפני התחלת ההתקנה, וודא שיש לך:

- ✅ Node.js 18+ ו-npm 9+
- ✅ PostgreSQL 14+
- ✅ Redis 6+
- ✅ חשבון Twilio (לשליחת SMS ו-WhatsApp)

## שלב 1: שכפול הפרויקט

```bash
git clone <repository-url>
cd "Arrival confirmation system"
```

## שלב 2: התקנת תלויות

```bash
# התקנת תלויות root
npm install

# התקנת תלויות לכל ה-workspaces
npm install --workspaces
```

## שלב 3: הגדרת בסיס נתונים

### PostgreSQL

```bash
# התחבר ל-PostgreSQL
psql -U postgres

# צור בסיס נתונים
CREATE DATABASE arrival_confirmation;

# צא מ-psql
\q

# הרץ סקריפט סכמה
cd packages/backend
psql -U postgres -d arrival_confirmation -f src/infrastructure/database/schema.sql
```

### Redis

```bash
# התחל Redis (על Ubuntu/Debian)
sudo systemctl start redis

# או על macOS עם Homebrew
brew services start redis

# בדוק שהשירות רץ
redis-cli ping
# אמור להחזיר: PONG
```

## שלב 4: משתני סביבה

### Backend

צור קובץ `.env` בתיקיית `packages/backend/`:

```bash
cp packages/backend/.env.example packages/backend/.env
```

ערוך את הקובץ עם הערכים שלך:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arrival_confirmation
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# CORS
CORS_ORIGIN=http://localhost:3000
```

### קבלת אישורי Twilio

1. הירשם ל-[Twilio](https://www.twilio.com)
2. צור פרויקט חדש
3. קבל Account SID ו-Auth Token מהדשבורד
4. קנה או אמת מספר טלפון

## שלב 5: הרצת המערכת

### באופן נפרד (מומלץ לפיתוח)

פתח 2 טרמינלים:

**טרמינל 1 - Backend:**
```bash
npm run dev:backend
```

**טרמינל 2 - Frontend:**
```bash
npm run dev:frontend
```

### באופן משולב

```bash
npm run dev
```

המערכת תהיה זמינה ב:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

## שלב 6: בדיקת התקנה

### בדוק Backend

```bash
curl http://localhost:5000/health
```

תגובה מצופה:
```json
{"status":"ok","timestamp":"2025-01-10T..."}
```

### בדוק Frontend

פתח דפדפן ב-http://localhost:3000

אמור לראות את עמוד ההתחברות.

## 🔥 פתרון בעיות נפוצות

### בעיה: שגיאת חיבור לבסיס נתונים

**פתרון:**
```bash
# בדוק ש-PostgreSQL רץ
sudo systemctl status postgresql

# בדוק חיבור
psql -U postgres -d arrival_confirmation -c "SELECT NOW();"
```

### בעיה: שגיאת חיבור ל-Redis

**פתרון:**
```bash
# בדוק ש-Redis רץ
redis-cli ping

# אם לא - הפעל אותו
sudo systemctl start redis
```

### בעיה: פורט 5000 תפוס

**פתרון:**
```bash
# מצא את התהליך שמשתמש בפורט
lsof -i :5000

# הרוג אותו
kill -9 <PID>

# או שנה את הפורט ב-.env
PORT=5001
```

### בעיה: חבילות חסרות

**פתרון:**
```bash
# נקה cache
npm cache clean --force

# מחק node_modules
rm -rf node_modules packages/*/node_modules

# התקן מחדש
npm install
```

## 🚀 בניה לפרודקשן

```bash
# בנה את כל הפרויקט
npm run build

# הרץ בפרודקשן
cd packages/backend
npm start
```

Frontend יצא בתיקייה `packages/frontend/dist` ויכול להיות מופרס על כל שרת סטטי (Nginx, Vercel, Netlify, וכו').

## 📝 צעדים הבאים

1. ✅ התקן את המערכת
2. ✅ צור משתמש ראשון
3. ✅ צור אירוע ראשון
4. ✅ הוסף אורחים
5. ✅ שלח הודעות

## 🆘 צריך עזרה?

- 📖 קרא את [README.md](./README.md)
- 🐛 פתח issue ב-GitHub
- 💬 צור קשר עם התמיכה

