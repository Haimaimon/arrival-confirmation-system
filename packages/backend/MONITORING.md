# 📊 מערכת מוניטורינג וביצועים

## 🎯 **סקירה כללית**

המערכת כוללת מערכת מוניטורינג מתקדמת שעוקבת אחר:
- ⚡ ביצועי API (זמני תגובה)
- 🗄️ שאילתות Database (זמני ריצה, מספר שורות)
- 💾 פעולות Cache (hit/miss rate, זמני תגובה)
- 🧠 שימוש במשאבי מערכת (זיכרון, CPU)
- 🏥 בריאות המערכת
- ✅ בדיקות Production Readiness

---

## 📁 **קבצי Log**

### **מיקום:**
```
packages/backend/logs/
├── combined-2025-01-05.log    # כל הלוגים
├── error-2025-01-05.log        # שגיאות בלבד
└── performance-2025-01-05.log  # ביצועים
```

### **מדיניות שמירה:**
- **Errors**: נשמרים 30 יום
- **Combined**: נשמרים 14 יום
- **Performance**: נשמרים 7 ימים
- **גודל מקסימלי**: 20MB לכל קובץ
- **רוטציה**: אוטומטית לפי תאריך

---

## 🔗 **Endpoints**

### **1️⃣ Health Check (ציבורי)**
```http
GET /api/v1/monitoring/health
```

**תשובה:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T10:30:00.000Z",
  "uptime": 3600.5,
  "checks": {
    "database": "OK",
    "cache": "OK"
  },
  "duration": "15ms"
}
```

**מתי להשתמש:**
- Load balancer health checks
- Monitoring tools (Datadog, New Relic, etc.)
- בדיקות אוטומטיות

---

### **2️⃣ Performance Metrics (מוגן)**
```http
GET /api/v1/monitoring/metrics
Authorization: Bearer <JWT_TOKEN>
```

**תשובה:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "count": 1250,
      "min": "5.23ms",
      "max": "1234.56ms",
      "avg": "125.45ms",
      "median": "98.23ms",
      "p95": "450.12ms",
      "p99": "850.67ms"
    },
    "database": {
      "count": 450,
      "min": "2.10ms",
      "max": "456.78ms",
      "avg": "45.23ms",
      "totalQueries": 450,
      "cacheHitRate": "78.50%",
      "totalRows": 12500,
      "avgRowsPerQuery": "27.78",
      "poolStats": {
        "total": 10,
        "idle": 8,
        "waiting": 0
      }
    },
    "cache": {
      "count": 800,
      "min": "0.50ms",
      "max": "15.23ms",
      "avg": "2.34ms",
      "totalOperations": 800,
      "hits": 650,
      "misses": 150,
      "hitRate": "81.25%",
      "operationCounts": {
        "GET": 600,
        "SET": 180,
        "DELETE": 20
      },
      "instanceStats": {
        "hits": 650,
        "misses": 150,
        "total": 800,
        "hitRate": "81.25%",
        "isConnected": true
      }
    },
    "system": {
      "uptime": "2.50 hours",
      "memory": {
        "heapUsed": "85.23 MB",
        "heapTotal": "120.45 MB",
        "external": "10.12 MB",
        "rss": "150.67 MB"
      },
      "cpu": {
        "user": 1234567,
        "system": 234567
      },
      "nodeVersion": "v20.10.0",
      "platform": "win32",
      "pid": 12345
    }
  }
}
```

**מתי להשתמש:**
- ניתוח ביצועים
- זיהוי בעיות
- אופטימיזציה
- דוחות

---

### **3️⃣ Production Readiness Check (מוגן)**
```http
GET /api/v1/monitoring/production-ready
Authorization: Bearer <JWT_TOKEN>
```

**תשובה:**
```json
{
  "success": true,
  "ready": true,
  "checks": {
    "databaseConnected": true,
    "cacheConnected": true,
    "environmentVariablesSet": true,
    "loggingConfigured": true,
    "jwtSecretSet": true,
    "productionMode": false,
    "databasePoolHealthy": true,
    "memoryUsageNormal": true
  },
  "recommendations": [
    "ℹ️ Not running in production mode. Set NODE_ENV=production"
  ]
}
```

**מתי להשתמש:**
- לפני deployment לproduction
- בדיקות CI/CD
- אימות הגדרות

---

## 📝 **סוגי לוגים**

### **1️⃣ API Request Logs**
```
✅ GET /api/v1/guests/event/123 | 200 | 125.45ms
⚠️ GET /api/v1/events | 429 | 5.23ms
❌ POST /api/v1/guests | 500 | 234.56ms
```

**אינדיקטורים:**
- ✅ = 2xx (Success)
- 🔀 = 3xx (Redirect)
- ⚠️ = 4xx (Client Error)
- ❌ = 5xx (Server Error)

---

### **2️⃣ Database Query Logs**
```
🗄️ DB Query: 45.23ms | Rows: 25 | Cached: NO
💾 DB Query: 2.10ms | Rows: 25 | Cached: YES
⚠️ DB Query: 456.78ms | Rows: 1000 | Cached: NO
🐌 DB Query: 1234.56ms | Rows: 5000 | Cached: NO
```

**אינדיקטורים:**
- 🗄️ = Normal query (< 100ms)
- ⚠️ = Slow query (100-500ms)
- 🐌 = Very slow query (> 500ms)
- 💾 = Cached result

---

### **3️⃣ Cache Operation Logs**
```
✅ Cache GET: HIT | guests:123:all | 2.34ms
❌ Cache GET: MISS | events:456 | 3.45ms
✅ Cache SET: HIT | tables:789 | 5.67ms
✅ Cache DELETE: HIT | guests:123:all | 1.23ms
```

**אינדיקטורים:**
- ✅ = Cache Hit
- ❌ = Cache Miss

---

### **4️⃣ Performance Logs**
```
⚡ Performance: API: GET /api/v1/guests completed in 125.45ms
🕐 Performance: Use Case: GetGuestsUseCase completed in 98.23ms
⚠️ Performance: API: POST /api/v1/import completed in 850.67ms
🐌 Performance: API: GET /api/v1/tables/stats completed in 1234.56ms
```

**אינדיקטורים:**
- ⚡ = Fast (< 200ms)
- 🕐 = Medium (200-500ms)
- ⚠️ = Slow (500-1000ms)
- 🐌 = Very Slow (> 1000ms)

---

## 🎯 **דוגמאות שימוש**

### **בדיקת בריאות המערכת**
```bash
curl http://localhost:5000/api/v1/monitoring/health
```

### **קבלת מטריקות ביצועים**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/monitoring/metrics
```

### **בדיקת Production Readiness**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/monitoring/production-ready
```

---

## 📊 **ניתוח ביצועים**

### **מדדי ביצועים מומלצים:**

| מדד | טוב | בינוני | גרוע |
|-----|-----|--------|------|
| **API Response Time (Avg)** | < 200ms | 200-500ms | > 500ms |
| **API Response Time (P95)** | < 500ms | 500-1000ms | > 1000ms |
| **DB Query Time (Avg)** | < 50ms | 50-100ms | > 100ms |
| **Cache Hit Rate** | > 80% | 60-80% | < 60% |
| **Memory Usage** | < 500MB | 500-1000MB | > 1000MB |

---

## 🔍 **זיהוי בעיות**

### **1️⃣ שאילתות איטיות**
```bash
# חפש בלוגים:
grep "🐌 DB Query" logs/combined-*.log

# דוגמה:
🐌 DB Query: 1234.56ms | Rows: 5000 | SELECT * FROM guests WHERE...
```

**פתרון:**
- הוסף אינדקס
- שפר את השאילתה
- הוסף pagination
- הפעל caching

---

### **2️⃣ Cache Miss Rate גבוה**
```bash
# בדוק hit rate:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/monitoring/metrics \
  | jq '.data.cache.hitRate'
```

**פתרון:**
- הגדל TTL של cache
- הוסף caching לendpoints נוספים
- בדוק invalidation logic

---

### **3️⃣ זיכרון מלא**
```bash
# בדוק שימוש בזיכרון:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/monitoring/metrics \
  | jq '.data.system.memory'
```

**פתרון:**
- אתחל את השרת
- בדוק memory leaks
- הגדל משאבי שרת
- הפעל garbage collection

---

### **4️⃣ Database Pool מלא**
```bash
# בדוק pool stats:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/monitoring/metrics \
  | jq '.data.database.poolStats'
```

**פתרון:**
- הגדל את pool size ב-.env:
  ```
  DB_POOL_MAX=20
  ```
- בדוק queries שלא נסגרים
- אופטם שאילתות

---

## 🚀 **Production Checklist**

לפני העלאה לproduction, וודא:

- [ ] ✅ `NODE_ENV=production`
- [ ] ✅ `JWT_SECRET` משונה מברירת המחדל
- [ ] ✅ Database מחובר
- [ ] ✅ Redis מחובר
- [ ] ✅ Log files נשמרים ב-persistent storage
- [ ] ✅ Monitoring endpoint נגיש
- [ ] ✅ Health check עובד
- [ ] ✅ Memory usage תקין
- [ ] ✅ Database pool תקין
- [ ] ✅ Cache hit rate > 70%
- [ ] ✅ API response time (P95) < 1000ms

---

## 🔔 **אינטגרציה עם כלי Monitoring**

### **Datadog / New Relic / AppDynamics:**
```javascript
// הוסף את health check endpoint שלנו
healthCheckUrl: 'http://your-domain.com/api/v1/monitoring/health'
interval: 60 // בדיקה כל דקה
```

### **Grafana / Prometheus:**
```yaml
scrape_configs:
  - job_name: 'arrival-confirmation'
    metrics_path: '/api/v1/monitoring/metrics'
    static_configs:
      - targets: ['localhost:5000']
```

---

## 📚 **קריאה נוספת**

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Performance](https://redis.io/docs/management/optimization/)

---

## 🎊 **סיכום**

המערכת כעת כוללת:
- ✅ Logging מתקדם עם Winston
- ✅ Performance monitoring
- ✅ Database query tracking
- ✅ Cache operation tracking
- ✅ Health checks
- ✅ Production readiness checks
- ✅ System metrics
- ✅ File rotation אוטומטי

**המערכת מוכנה לproduction! 🚀**

