# 🗄️ איתחול הדאטאבייס

## דרישות

1. **PostgreSQL 14+** מותקן
2. **Redis** (אופציונלי לפיתוח)

---

## 📦 התקנת PostgreSQL (אם לא מותקן)

### Windows:
1. הורד מ-https://www.postgresql.org/download/windows/
2. התקן עם הסיסמה: `Nimo054!!` (או שנה ב-`.env`)
3. Port: `5432`

### Mac:
```bash
brew install postgresql
brew services start postgresql
```

### Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 🔧 איתחול הדאטאבייס

### Windows:

#### אופציה 1: דרך pgAdmin
1. פתח pgAdmin
2. צור database חדש: `arrival_confirmation`
3. פתח Query Tool
4. העתק והרץ את `packages/backend/src/infrastructure/database/schema.sql`
5. העתק והרץ את `packages/backend/src/infrastructure/database/seed.sql`

#### אופציה 2: דרך Command Line
```powershell
cd packages\backend

# צור database
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE arrival_confirmation;"

# הרץ schema
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d arrival_confirmation -f src\infrastructure\database\schema.sql

# הרץ seed
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d arrival_confirmation -f src\infrastructure\database\seed.sql
```

---

### Mac/Linux:

```bash
cd packages/backend

# צור database
psql -U postgres -c "CREATE DATABASE arrival_confirmation;"

# הרץ schema
psql -U postgres -d arrival_confirmation -f src/infrastructure/database/schema.sql

# הרץ seed
psql -U postgres -d arrival_confirmation -f src/infrastructure/database/seed.sql
```

---

## ✅ אימות שהכל עובד

### 1. בדוק שהטבלאות נוצרו:
```bash
psql -U postgres -d arrival_confirmation -c "\dt"
```

אמורות להופיע:
- `users`
- `events`
- `guests`
- `tables`
- `notifications`

### 2. בדוק שיש user seed:
```bash
psql -U postgres -d arrival_confirmation -c "SELECT email FROM users;"
```

אמור להופיע:
- `demo@example.com`

---

## 🚀 הרצת המערכת

### 1. Backend:
```bash
cd packages/backend
npm install
npm run dev
```

### 2. Frontend:
```bash
cd packages/frontend
npm install
npm run dev
```

### 3. התחברות:
```
Email: demo@example.com
Password: Demo123!
```

---

## 🐛 פתרון בעיות

### "אין אורחים אחרי הוספה"

#### בדיקות:
1. ✅ **וודא שהבקאנד רץ** על `http://localhost:5000`
2. ✅ **וודא שהדאטאבייס אותחלה** (הרץ schema.sql)
3. ✅ **וודא שיש eventId ב-URL**:
   - ❌ לא נכון: `/guests`
   - ✅ נכון: `/events/<event-id>/guests`
4. ✅ **פתח Developer Tools (F12)** ובדוק:
   - Console: חפש שגיאות API
   - Network: חפש בקשות שנכשלות

#### דרך נכונה להוסיף אורחים:
1. **לך ל-`/events`** (דף האירועים)
2. **לחץ "ניהול אורחים"** באירוע
3. **לחץ "הוסף אורח"**
4. **מלא פרטים ושמור**

#### אם עדיין לא עובד:
```javascript
// בדוק ב-Console:
🎯 GuestsPage - eventId: <should-see-uuid-here>
🎯 GuestsPage - URL: /events/<event-id>/guests
📊 Guests data: <should-see-array-here>
```

### "Cannot connect to database"

1. וודא שPostgreSQL רץ:
   - Windows: Services → PostgreSQL → Start
   - Mac: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

2. בדוק סיסמה ב-`.env`:
   ```
   DB_PASSWORD=<your-password>
   ```

3. נסה התחברות ידנית:
   ```bash
   psql -U postgres -h localhost
   ```

### "Port 5000 already in use"

שנה פורט בקאנד ב-`packages/backend/.env`:
```
PORT=5001
```

ועדכן גם בפרונטאנד ב-`packages/frontend/vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
  }
}
```

---

## 📞 צריך עזרה?

1. פתח Developer Tools (F12)
2. צלם screenshot של שגיאות
3. שתף את הלוגים

---

**✨ בהצלחה!**

