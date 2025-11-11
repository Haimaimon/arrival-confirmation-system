# 🎊 מערכת אישורי הגעה מתקדמת

> מערכת מקצועית ומודולרית לניהול אישורי הגעה לאירועים עם ארכיטקטורה נקייה, זמן אמת, ואופטימיזציה מלאה.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 תוכן עניינים

- [סקירה כללית](#-סקירה-כללית)
- [תכונות](#-תכונות-עיקריות)
- [טכנולוגיות](#️-טכנולוגיות)
- [התקנה מהירה](#-התקנה-מהירה)
- [ארכיטקטורה](#️-ארכיטקטורה)
- [תיעוד](#-תיעוד)
- [פריסה](#-פריסה)
- [רישיון](#-רישיון)

## 🌟 סקירה כללית

מערכת מקיפה לניהול אישורי הגעה לאירועים, הבנויה עם הסטנדרטים הגבוהים ביותר של פיתוח תוכנה. המערכת כוללת שליחת הודעות אוטומטיות (SMS, WhatsApp, שיחות טלפון), ניהול אורחים מתקדם, סידורי הושבה דיגיטליים, ודשבורד זמן אמת.

### 🎯 למי זה מיועד?

- 💒 מארגני חתונות
- 🎂 מארגני אירועי יום הולדת
- 🎉 מארגני בר/בת מצווה
- 🏢 מארגני אירועים עסקיים
- 🎊 כל אירוע שדורש ניהול אורחים ואישורי הגעה

## 🚀 תכונות עיקריות

### 📱 מערכת התראות חכמה

- **2 הודעות SMS** אוטומטיות לכל אורח
- **3 הודעות WhatsApp** רשמיות
- **4 שיחות טלפון** אוטומטיות
- **תזכורות** בבוקר ובערב האירוע
- **הודעת תודה** אוטומטית ליום אחרי

### 👥 ניהול אורחים מתקדם

- ✅ ייבוא המוני מ-**Excel** במהירות
- ✅ חיפוש וסינון מתקדמים
- ✅ מעקב סטטוס (אישר/סירב/ממתין/לא הגיב)
- ✅ ניהול קשרי משפחה וקבוצות
- ✅ הערות ותיוגים מותאמים אישית

### 🪑 סידורי הושבה דיגיטליים

- 🎯 **זיהוי אוטומטי** של מקומות פנויים
- 💰 **חיסכון כסף** - המלצות לאופטימיזציה
- 📍 שיוך אורחים לשולחנות בגרירה
- 🗺️ מפת אולם אינטראקטיבית
- 📊 סטטיסטיקות תפוסה בזמן אמת

### 📊 דשבורד זמן אמת

- 📈 סטטיסטיקות חיות עם **WebSocket**
- 🔔 התראות והתרעות מיידיות
- 📉 גרפים ותרשימים אינטראקטיביים
- 📋 דוחות מפורטים ליצוא
- 🎨 עיצוב הזמנות מותאם אישית

### 💳 תכונות נוספות

- 🎁 מתנות באשראי (אינטגרציה עם מערכות תשלום)
- 🗺️ ניווט אוטומטי לאולם (Google Maps)
- 📧 שליחת אימיילים מעוצבים
- 🔐 אבטחה מלאה עם JWT
- 🌐 תמיכה בעברית ואנגלית

## 🛠️ טכנולוגיות

### Frontend (Client)

| טכנולוגיה | תיאור | גרסה |
|-----------|--------|------|
| ![React](https://img.shields.io/badge/React-18-blue) | ספריית UI מודרנית | 18.2+ |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) | Type Safety | 5.3+ |
| ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC) | עיצוב מתקדם | 3.4+ |
| ![React Query](https://img.shields.io/badge/React_Query-5.x-FF4154) | ניהול State + Cache | 5.14+ |
| ![Zustand](https://img.shields.io/badge/Zustand-4.x-333) | ניהול State גלובלי | 4.4+ |
| ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101) | Real-time Updates | 4.6+ |
| ![Vite](https://img.shields.io/badge/Vite-5.x-646CFF) | Build Tool מהיר | 5.0+ |

### Backend (Server)

| טכנולוגיה | תיאור | גרסה |
|-----------|--------|------|
| ![Node.js](https://img.shields.io/badge/Node.js-18+-green) | Runtime Environment | 18+ |
| ![Express](https://img.shields.io/badge/Express-4.x-black) | Web Framework | 4.18+ |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) | Type Safety | 5.3+ |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue) | Database | 14+ |
| ![Redis](https://img.shields.io/badge/Redis-7-red) | Caching | 7+ |
| ![JWT](https://img.shields.io/badge/JWT-9.x-black) | Authentication | 9.0+ |
| ![Twilio](https://img.shields.io/badge/Twilio-4.x-F22F46) | SMS & WhatsApp | 4.20+ |
| ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101) | WebSocket | 4.6+ |

### DevOps & Infrastructure

- 🐳 **Docker** + Docker Compose
- ⚙️ **Nginx** Reverse Proxy
- 🔄 **PM2** Process Manager
- 📊 **Winston** Logging
- 🔐 **Let's Encrypt** SSL
- 📈 **Sentry** Error Tracking (optional)

## ⚡ התקנה מהירה

### דרישות מקדימות

```bash
Node.js: 18+
PostgreSQL: 14+
Redis: 7+
```

### התקנה (3 שלבים)

```bash
# 1. שכפול והתקנת תלויות
git clone <repository-url>
cd "Arrival confirmation system"
npm install

# 2. הגדרת משתני סביבה
cp packages/backend/.env.example packages/backend/.env
# ערוך את הקובץ עם הנתונים שלך

# 3. הרצת המערכת
npm run dev
```

המערכת תהיה זמינה ב:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend: http://localhost:5000

**למדריך מפורט:** ראה [QUICKSTART.md](./QUICKSTART.md) או [INSTALLATION.md](./INSTALLATION.md)

## 🏗️ ארכיטקטורה

המערכת בנויה לפי **Clean Architecture** ו-**SOLID Principles**:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│     (UI, Controllers, WebSocket)            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Application Layer                   │
│      (Use Cases, Business Logic)            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            Domain Layer                     │
│    (Entities, Pure Business Logic)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Infrastructure Layer                 │
│    (Database, APIs, External Services)      │
└─────────────────────────────────────────────┘
```

### עקרונות עיצוב

- ✅ **SOLID Principles** - קוד נקי ומודולרי
- ✅ **Dependency Injection** - תלויות הפיכות
- ✅ **Repository Pattern** - הפשטת גישה לנתונים
- ✅ **Clean Architecture** - הפרדת שכבות ברורה
- ✅ **Domain-Driven Design** - לוגיקה עסקית במרכז

למידע מפורט: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📁 מבנה הפרויקט

```
arrival-confirmation-system/
├── packages/
│   ├── frontend/                    # React Application
│   │   ├── src/
│   │   │   ├── presentation/       # UI Components, Pages
│   │   │   ├── application/        # Hooks, Stores
│   │   │   ├── domain/             # Entities, Types
│   │   │   └── infrastructure/     # API, WebSocket
│   │   ├── public/
│   │   └── package.json
│   │
│   └── backend/                     # Node.js API
│       ├── src/
│       │   ├── domain/             # Entities, Interfaces
│       │   ├── application/        # Use Cases
│       │   ├── infrastructure/     # DB, Services
│       │   └── presentation/       # Controllers, Routes
│       └── package.json
│
├── docker-compose.yml               # Docker orchestration
├── nginx.conf                       # Nginx configuration
├── ecosystem.config.js              # PM2 configuration
├── ARCHITECTURE.md                  # תיעוד ארכיטקטורה
├── API_DOCUMENTATION.md             # תיעוד API
├── DEPLOYMENT.md                    # מדריך פריסה
└── README.md                        # קובץ זה
```

## 📚 תיעוד

| מסמך | תיאור |
|------|--------|
| [QUICKSTART.md](./QUICKSTART.md) | התחלה מהירה ב-5 דקות |
| [INSTALLATION.md](./INSTALLATION.md) | מדריך התקנה מפורט |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | ארכיטקטורה ועקרונות פיתוח |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | תיעוד API מלא |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | מדריך פריסה לפרודקשן |

## 🚀 פריסה

### Docker (מומלץ)

```bash
# Build והרצה
docker-compose up -d

# צפייה בלוגים
docker-compose logs -f

# עצירה
docker-compose down
```

### VPS מסורתי

```bash
# בניה לפרודקשן
npm run build

# הרצה עם PM2
pm2 start ecosystem.config.js --env production
```

### Serverless

- Frontend: Deploy ל-Vercel/Netlify
- Backend: Deploy ל-Railway/Render
- Database: Supabase/PlanetScale

למידע מפורט: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔐 אבטחה

המערכת כוללת:

- 🔒 **JWT Authentication** - אימות מאובטח
- 🛡️ **Rate Limiting** - הגנה מפני התקפות
- ✅ **Input Validation** - בדיקת נתונים עם Zod
- 🔐 **Password Hashing** - bcrypt עם salt
- 🌐 **CORS Configuration** - הגנה על ה-API
- 🔍 **SQL Injection Prevention** - שאילתות מוכנות
- 🚫 **XSS Protection** - הגנה מפני סקריפטים

## 🧪 בדיקות

```bash
# הרצת כל הבדיקות
npm test

# Coverage
npm run test:coverage

# E2E Tests
npm run test:e2e
```

## 📊 ביצועים

### אופטימיזציות

- ⚡ **React Query** - Caching חכם
- 💾 **Redis** - Cache בצד שרת
- 🔄 **Connection Pooling** - ניהול חיבורי DB
- 📦 **Code Splitting** - טעינה מהירה
- 🗜️ **Gzip Compression** - הקטנת גודל
- 🖼️ **Image Optimization** - WebP + Lazy Loading

### מדדים

- ⏱️ Time to First Byte: < 100ms
- 🚀 First Contentful Paint: < 1s
- 📊 Time to Interactive: < 2s

## 🤝 תרומה

אנחנו מזמינים תרומות! אנא קרא את [CONTRIBUTING.md](./CONTRIBUTING.md) לפרטים.

## 📄 רישיון

הפרויקט מופץ תחת רישיון MIT. ראה [LICENSE](./LICENSE) לפרטים.

## 👥 צוות

- **Lead Developer**: [Your Name]
- **Contributors**: [List of Contributors]

## 🙏 תודות

תודה מיוחדת ל:
- Twilio עבור שירותי ההודעות
- הקהילה של React ו-Node.js
- כל התורמים לפרויקט

## 📞 יצירת קשר ותמיכה

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/arrival-system/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/arrival-system/discussions)
- 📱 WhatsApp: +972-XX-XXX-XXXX

---

<div align="center">

**Made with ❤️ by [Your Team Name]**

⭐ אם המערכת עזרה לך, אנא תן לנו כוכב ב-GitHub!

[🌟 Star on GitHub](https://github.com/yourusername/arrival-system)

</div>

