# 🏗️ ארכיטקטורה - מערכת אישורי הגעה

## סקירה כללית

המערכת בנויה לפי עקרונות **Clean Architecture** ו-**SOLID**, עם הפרדה ברורה בין שכבות ותלויות חד-כיווניות.

## 📐 שכבות הארכיטקטורה

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│  (UI, Controllers, Routes, WebSocket)                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│             Application Layer                        │
│  (Use Cases, Business Logic, Orchestration)          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│               Domain Layer                           │
│  (Entities, Interfaces, Pure Business Logic)         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│           Infrastructure Layer                       │
│  (Database, External APIs, Frameworks)               │
└─────────────────────────────────────────────────────┘
```

## 🎯 Domain Layer (שכבת הדומיין)

**מיקום:** `src/domain/`

**אחריות:**
- הגדרת ישויות עסקיות (Entities)
- לוגיקה עסקית טהורה
- הגדרת ממשקים (Interfaces)

**ללא תלויות חיצוניות!**

### Entities (ישויות)

```typescript
📁 domain/entities/
├── Guest.ts          // מידע על אורחים
├── Event.ts          // אירועים
├── Table.ts          // שולחנות
├── Notification.ts   // הודעות
└── User.ts          // משתמשים
```

**דוגמה:**
```typescript
export class Guest {
  private props: GuestProps;
  
  // Business logic
  canSendSms(): boolean {
    return this.props.smsCount < 2;
  }
  
  confirm(): void {
    if (this.props.status === GuestStatus.CONFIRMED) {
      throw new Error('Guest is already confirmed');
    }
    this.props.status = GuestStatus.CONFIRMED;
  }
}
```

### Repositories Interfaces

```typescript
📁 domain/repositories/
├── IGuestRepository.ts
├── IEventRepository.ts
└── ITableRepository.ts
```

**עיקרון:** Domain מגדיר מה צריך, Infrastructure מממש איך.

## 🎬 Application Layer (שכבת היישום)

**מיקום:** `src/application/`

**אחריות:**
- Use Cases - תהליכים עסקיים
- תיאום בין repositories
- ניהול טרנזקציות

```typescript
📁 application/use-cases/
├── guest/
│   ├── CreateGuestUseCase.ts
│   ├── ConfirmGuestUseCase.ts
│   └── ImportGuestsFromExcelUseCase.ts
├── notification/
│   └── SendConfirmationRequestUseCase.ts
└── event/
    └── CreateEventUseCase.ts
```

**דוגמה לשימוש ב-Use Case:**
```typescript
export class ConfirmGuestUseCase {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private cacheService: ICacheService
  ) {}

  async execute(dto: ConfirmGuestDTO): Promise<Guest> {
    // 1. Find guest
    const guest = await this.guestRepository.findById(dto.guestId);
    
    // 2. Business logic
    guest.confirm();
    
    // 3. Save
    const updated = await this.guestRepository.update(guest);
    
    // 4. Update event stats
    const event = await this.eventRepository.findById(guest.eventId);
    event.incrementConfirmed();
    await this.eventRepository.update(event);
    
    // 5. Invalidate cache
    await this.cacheService.delete(`event:${event.id}`);
    
    return updated;
  }
}
```

## 🏭 Infrastructure Layer (שכבת התשתית)

**מיקום:** `src/infrastructure/`

**אחריות:**
- מימוש ממשקים מה-Domain
- חיבור לבסיסי נתונים
- קריאות ל-APIs חיצוניים
- שירותים טכניים (Cache, JWT, וכו')

```typescript
📁 infrastructure/
├── database/
│   ├── PostgresGuestRepository.ts    // מממש IGuestRepository
│   ├── connection.ts
│   └── schema.sql
├── services/
│   ├── TwilioNotificationService.ts  // מממש INotificationService
│   └── RedisCacheService.ts          // מממש ICacheService
└── security/
    ├── JWTService.ts
    └── PasswordService.ts
```

## 🎨 Presentation Layer (שכבת המצגת)

**מיקום:** `src/presentation/`

**אחריות:**
- Controllers - קבלת HTTP requests
- Routes - ניתוב
- Middlewares - אבטחה, validation
- WebSocket - real-time

```typescript
📁 presentation/
├── controllers/
│   └── GuestController.ts
├── middlewares/
│   ├── authMiddleware.ts
│   ├── validationMiddleware.ts
│   └── rateLimitMiddleware.ts
├── routes/
│   └── guestRoutes.ts
└── websocket/
    └── RealtimeServer.ts
```

## 🔄 זרימת נתונים (Data Flow)

### דוגמה: יצירת אורח חדש

```
1. Frontend
   └─> API Request: POST /api/v1/guests
       
2. Presentation Layer
   └─> authMiddleware (בדיקת JWT)
   └─> validationMiddleware (בדיקת נתונים)
   └─> GuestController.createGuest()
       
3. Application Layer
   └─> CreateGuestUseCase.execute()
       ├─> Validate event exists
       ├─> Create Guest entity
       ├─> Save to repository
       └─> Update event stats
       
4. Domain Layer
   └─> Guest.validate()
   └─> Event.canAddGuests()
       
5. Infrastructure Layer
   └─> PostgresGuestRepository.save()
   └─> Database INSERT
       
6. Response
   └─> Return guest data to client
   └─> Emit WebSocket event (real-time)
```

## 🔐 אבטחה (Security)

### JWT Authentication

```typescript
// 1. Login → Generate JWT
const tokens = jwtService.generateTokens({
  userId: user.id,
  email: user.email,
  role: user.role,
});

// 2. Store in localStorage (Frontend)
localStorage.setItem('accessToken', tokens.accessToken);

// 3. Send with requests
headers: {
  Authorization: `Bearer ${token}`
}

// 4. Validate in middleware
const payload = jwtService.verifyToken(token);
req.user = payload;
```

### Rate Limiting

```typescript
// General API
rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })

// Authentication
rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })

// Notifications
rateLimit({ windowMs: 60 * 1000, max: 10 })
```

### Input Validation

```typescript
import { z } from 'zod';

const createGuestSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().regex(/^(\+972|972|0)[0-9]{9}$/),
    email: z.string().email().optional(),
  }),
});
```

## 📊 Caching Strategy

### Multi-Level Caching

```typescript
// 1. Memory Cache (React Query)
staleTime: 5 * 60 * 1000  // 5 minutes

// 2. Redis Cache
await cacheService.set(
  'guests:event123',
  data,
  300  // TTL: 5 minutes
);

// 3. Database
PostgreSQL with indexes
```

### Cache Invalidation

```typescript
// When guest confirms:
await cacheService.delete('guests:event123');
await cacheService.delete('event:123:stats');
queryClient.invalidateQueries(['guests']);
```

## 🔌 Real-time Updates (WebSocket)

### Architecture

```
Client                     Server
  │                          │
  ├─ connect ──────────────> │
  │                          │
  ├─ join:event123 ────────> │
  │                          │
  │  <── guest:confirmed ─── │ (broadcast to room)
  │                          │
  │  <── stats:update ─────  │ (broadcast to room)
```

### Implementation

```typescript
// Server
realtimeServer.emitGuestConfirmed(eventId, guestData);

// Client
socketClient.on('guest:confirmed', (data) => {
  queryClient.invalidateQueries(['guests']);
  toast.success(`${data.name} אישר הגעה!`);
});
```

## 📦 Dependency Injection

### Backend

```typescript
// Bootstrap
const dbConnection = createDatabaseConnection();
const cacheService = new RedisCacheService(config);
const guestRepository = new PostgresGuestRepository(dbConnection);

// Inject dependencies
const controller = new GuestController(
  guestRepository,
  eventRepository,
  cacheService
);
```

### Frontend

```typescript
// API Client as singleton
export const apiClient = new ApiClient();

// React Query for data management
const queryClient = new QueryClient();
```

## 🎯 SOLID Principles

### Single Responsibility
כל class עושה דבר אחד:
- `Guest` - ישות אורח
- `GuestRepository` - גישה לנתונים
- `CreateGuestUseCase` - יצירת אורח

### Open/Closed
פתוח להרחבה, סגור לשינוי:
```typescript
interface INotificationService {
  send(params): Promise<Result>;
}

class TwilioService implements INotificationService {}
class SendGridService implements INotificationService {}
```

### Liskov Substitution
ניתן להחליף מימושים:
```typescript
// Development
const notificationService = new MockNotificationService();

// Production
const notificationService = new TwilioNotificationService();
```

### Interface Segregation
ממשקים ספציפיים:
```typescript
interface IGuestRepository {}
interface IEventRepository {}
// Not: interface IMegaRepository {}
```

### Dependency Inversion
תלות בממשקים, לא במימושים:
```typescript
class UseCase {
  constructor(
    private repo: IGuestRepository  // Interface, not concrete
  ) {}
}
```

## 🚀 Performance Optimizations

### Database
- ✅ Indexes על שדות מחפוש
- ✅ Connection pooling
- ✅ Prepared statements

### Caching
- ✅ Redis לנתונים חמים
- ✅ React Query לצד לקוח
- ✅ HTTP cache headers

### Bundle Optimization
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Lazy loading routes

### API Optimization
- ✅ Pagination
- ✅ Field selection
- ✅ Batch operations

## 📈 Scalability

### Horizontal Scaling
- Backend: Multiple instances + Load balancer
- Database: Read replicas
- Redis: Cluster mode

### Vertical Scaling
- Database connection pool
- Worker threads for heavy operations
- Queue system (Bull) for async jobs

## 🧪 Testing Strategy

```
Unit Tests → Integration Tests → E2E Tests
    ↓              ↓                 ↓
  Domain        Use Cases         Full Flow
  Entities      + Repos          Frontend → Backend
```

## 📝 Summary

המערכת מבוססת על ארכיטקטורה נקייה עם:
- ✅ הפרדה ברורה בין שכבות
- ✅ תלויות חד-כיווניות
- ✅ קוד ניתן לבדיקה
- ✅ גמישות ואפשרות להחלפת מימושים
- ✅ מוכן לקנה מידה

