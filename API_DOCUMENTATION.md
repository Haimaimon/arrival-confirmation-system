# 📡 API Documentation

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

כל ה-endpoints מחייבים authentication מלבד `/auth/login` ו-`/auth/register`.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Endpoints

### 🔐 Authentication

#### POST /auth/register
רישום משתמש חדש

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "יוסי",
  "lastName": "כהן",
  "phone": "0501234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "יוסי",
      "lastName": "כהן"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 604800
    }
  }
}
```

#### POST /auth/login
התחברות

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

---

### 👤 Guests

#### GET /guests/event/:eventId
קבלת רשימת אורחים לאירוע

**Query Parameters:**
- `status` (optional): PENDING | CONFIRMED | DECLINED
- `search` (optional): חיפוש חופשי

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "firstName": "דוד",
      "lastName": "כהן",
      "phone": "0501234567",
      "email": "david@example.com",
      "type": "ADULT",
      "status": "CONFIRMED",
      "numberOfGuests": 2,
      "tableNumber": 5,
      "seatNumber": 3,
      "smsCount": 1,
      "whatsappCount": 2,
      "phoneCallCount": 0,
      "confirmedAt": "2025-01-10T10:00:00Z",
      "createdAt": "2025-01-05T08:00:00Z"
    }
  ]
}
```

#### POST /guests
יצירת אורח חדש

**Request:**
```json
{
  "eventId": "uuid",
  "firstName": "דוד",
  "lastName": "כהן",
  "phone": "0501234567",
  "email": "david@example.com",
  "type": "ADULT",
  "numberOfGuests": 2,
  "notes": "טבעוני"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### GET /guests/:id
קבלת פרטי אורח

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### PATCH /guests/:id/confirm
אישור הגעת אורח

**Request:**
```json
{
  "numberOfGuests": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### DELETE /guests/:id
מחיקת אורח

**Response:**
```json
{
  "success": true,
  "message": "Guest deleted successfully"
}
```

#### POST /guests/event/:eventId/import
ייבוא אורחים מ-Excel

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "success": true,
  "data": {
    "successCount": 45,
    "failureCount": 2,
    "errors": [
      {
        "row": 10,
        "error": "Invalid phone number"
      }
    ],
    "guests": [ ... ]
  }
}
```

---

### 📅 Events

#### GET /events
קבלת כל האירועים של המשתמש

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "חתונה של דוד ורחל",
      "type": "WEDDING",
      "status": "ACTIVE",
      "eventDate": "2025-01-15T18:00:00Z",
      "venue": {
        "name": "אולם האירועים הגדול",
        "address": "רחוב הרצל 1",
        "city": "תל אביב",
        "googleMapsUrl": "https://maps.google.com/..."
      },
      "settings": {
        "enableSms": true,
        "enableWhatsApp": true,
        "seatsPerTable": 10,
        "maxTables": 30
      },
      "totalInvited": 250,
      "totalConfirmed": 180,
      "totalDeclined": 30,
      "totalPending": 40
    }
  ]
}
```

#### POST /events
יצירת אירוע חדש

**Request:**
```json
{
  "name": "חתונה של דוד ורחל",
  "type": "WEDDING",
  "eventDate": "2025-01-15T18:00:00Z",
  "venue": {
    "name": "אולם האירועים הגדול",
    "address": "רחוב הרצל 1",
    "city": "תל אביב"
  },
  "settings": {
    "enableSms": true,
    "enableWhatsApp": true,
    "enablePhoneCalls": true,
    "seatsPerTable": 10,
    "maxTables": 30
  }
}
```

#### GET /events/:id
קבלת פרטי אירוע

#### PATCH /events/:id
עדכון אירוע

#### DELETE /events/:id
מחיקת אירוע

---

### 🔔 Notifications

#### GET /notifications/event/:eventId
קבלת כל ההודעות של אירוע

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "guestId": "uuid",
      "type": "SMS",
      "purpose": "CONFIRMATION_REQUEST",
      "status": "SENT",
      "recipient": "0501234567",
      "message": "שלום דוד...",
      "sentAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

#### POST /notifications/send
שליחת הודעה חדשה

**Request:**
```json
{
  "guestId": "uuid",
  "type": "SMS",
  "customMessage": "שלום! מזמינים אותך..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "SENT",
    "sentAt": "2025-01-10T10:30:00Z"
  }
}
```

#### POST /notifications/bulk
שליחה המונית

**Request:**
```json
{
  "eventId": "uuid",
  "type": "WHATSAPP",
  "guestIds": ["uuid1", "uuid2", "uuid3"],
  "message": "תזכורת: האירוע מחר!"
}
```

---

### 🪑 Tables (Seating)

#### GET /tables/event/:eventId
קבלת שולחנות

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "tableNumber": 1,
      "capacity": 10,
      "occupiedSeats": 8,
      "section": "מרכז"
    }
  ]
}
```

#### POST /tables
יצירת שולחן

**Request:**
```json
{
  "eventId": "uuid",
  "tableNumber": 1,
  "capacity": 10,
  "section": "מרכז"
}
```

#### PATCH /tables/:id/assign
שיוך אורח לשולחן

**Request:**
```json
{
  "guestId": "uuid",
  "seatNumber": 3
}
```

---

## Error Responses

כל ה-errors מוחזרים בפורמט הבא:

```json
{
  "success": false,
  "error": "Error message here",
  "details": [ ... ]  // אופציונלי
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Notifications**: 10 requests per minute

---

## WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events to Listen

#### guest:confirmed
```javascript
socket.on('guest:confirmed', (data) => {
  console.log('Guest confirmed:', data);
  // { guestId, eventId, name, numberOfGuests }
});
```

#### guest:declined
```javascript
socket.on('guest:declined', (data) => {
  console.log('Guest declined:', data);
});
```

#### stats:update
```javascript
socket.on('stats:update', (data) => {
  console.log('Stats updated:', data);
  // { eventId, confirmed, declined, pending }
});
```

#### notification:sent
```javascript
socket.on('notification:sent', (data) => {
  console.log('Notification sent:', data);
});
```

#### table:updated
```javascript
socket.on('table:updated', (data) => {
  console.log('Table updated:', data);
});
```

### Events to Emit

#### join:event
```javascript
socket.emit('join:event', eventId);
```

#### leave:event
```javascript
socket.emit('leave:event', eventId);
```

---

## Excel Import Format

### Required Columns

| Column Name (Hebrew) | Column Name (English) | Type | Required | Example |
|---------------------|----------------------|------|----------|---------|
| שם פרטי | firstName | string | Yes | דוד |
| שם משפחה | lastName | string | Yes | כהן |
| טלפון | phone | string | Yes | 0501234567 |
| אימייל | email | string | No | david@example.com |
| מספר מוזמנים | numberOfGuests | number | No | 2 |
| סוג | type | string | No | ADULT |
| הערות | notes | string | No | טבעוני |

### Example Excel File

```
| שם פרטי | שם משפחה | טלפון | אימייל | מספר מוזמנים |
|---------|----------|-------|--------|--------------|
| דוד | כהן | 0501234567 | david@example.com | 2 |
| שרה | לוי | 0509876543 | sarah@example.com | 1 |
```

---

## Postman Collection

ניתן ליבא את ה-API collection ל-Postman:

```bash
https://www.postman.com/collections/...
```

---

## SDK / Client Libraries

### JavaScript/TypeScript

```bash
npm install @arrival-system/client
```

```typescript
import { ArrivalClient } from '@arrival-system/client';

const client = new ArrivalClient({
  baseUrl: 'http://localhost:5000/api/v1',
  token: 'your_jwt_token'
});

const guests = await client.guests.list(eventId);
```

