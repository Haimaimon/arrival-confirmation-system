# 🚀 Deployment Guide - מערכת אישורי הגעה

## סקירה כללית

המערכת מורכבת מ-3 חלקים עיקריים:
1. **Frontend** - React SPA
2. **Backend** - Node.js API
3. **Infrastructure** - PostgreSQL + Redis

## 🌐 אפשרויות פריסה

### אפשרות 1: VPS מלא (מומלץ)

**לדוגמה:** DigitalOcean, AWS EC2, Google Cloud, Azure

#### יתרונות:
- שליטה מלאה
- עלות יעילה למערכות בינוניות-גדולות
- קל לסקייל

#### צעדי פריסה:

```bash
# 1. התקן תלויות בסיסיות
sudo apt update
sudo apt install nodejs npm postgresql redis-server nginx

# 2. הגדר PostgreSQL
sudo -u postgres createdb arrival_confirmation
sudo -u postgres psql -d arrival_confirmation -f schema.sql

# 3. בנה את הפרויקט
npm run build

# 4. הגדר PM2 (Process Manager)
npm install -g pm2
pm2 start packages/backend/dist/index.js --name arrival-backend
pm2 startup
pm2 save

# 5. הגדר Nginx
sudo cp nginx.conf /etc/nginx/sites-available/arrival-system
sudo ln -s /etc/nginx/sites-available/arrival-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### אפשרות 2: Docker + Docker Compose

#### Dockerfile - Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm install

COPY packages/backend ./packages/backend

WORKDIR /app/packages/backend

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

#### Dockerfile - Frontend

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

RUN npm install

COPY packages/frontend ./packages/frontend

WORKDIR /app/packages/frontend

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: arrival_confirmation
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./packages/backend/src/infrastructure/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

#### הרצה עם Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### אפשרות 3: Serverless (Vercel + Railway)

#### Frontend → Vercel

```bash
# התקן Vercel CLI
npm i -g vercel

# Deploy
cd packages/frontend
vercel --prod
```

#### Backend → Railway

```bash
# התקן Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd packages/backend
railway up
```

#### Database → Railway/Supabase

```bash
# צור PostgreSQL instance ב-Railway
railway add postgresql

# צור Redis instance
railway add redis

# הגדר משתני סביבה
railway variables set JWT_SECRET=your-secret
railway variables set TWILIO_ACCOUNT_SID=your-sid
```

---

## 🔐 הגדרת SSL/HTTPS

### Let's Encrypt + Certbot

```bash
# התקן Certbot
sudo apt install certbot python3-certbot-nginx

# קבל תעודה
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# חידוש אוטומטי
sudo certbot renew --dry-run
```

### Nginx Configuration עם SSL

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/arrival-system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs

# Monitor
pm2 monit

# Web Dashboard
pm2 web
```

### Winston Logging

הלוגים נשמרים אוטומטית ב-`logs/` directory.

```typescript
// packages/backend/src/infrastructure/logging/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### Error Tracking - Sentry

```bash
npm install @sentry/node @sentry/react
```

```typescript
// Backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});

// Frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/arrival-system
            git pull
            npm install
            npm run build
            pm2 restart arrival-backend
```

---

## 🗄️ Database Backup

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"

pg_dump -U postgres arrival_confirmation | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## ⚡ Performance Optimization

### Backend

1. **Enable compression**
```typescript
import compression from 'compression';
app.use(compression());
```

2. **Add response caching**
```typescript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

3. **Connection pooling**
```typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
});
```

### Frontend

1. **Build optimization**
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
};
```

2. **Image optimization**
- השתמש ב-WebP
- Lazy loading
- CDN לתמונות

### Database

```sql
-- Create indexes
CREATE INDEX idx_guests_event_status ON guests(event_id, status);
CREATE INDEX idx_guests_phone ON guests(phone);

-- Analyze tables
ANALYZE guests;
ANALYZE events;
```

---

## 🔄 Zero-Downtime Deployment

### Blue-Green Deployment

```bash
# 1. Deploy to "green" environment
pm2 start ecosystem.green.config.js

# 2. Test green
curl http://localhost:5001/health

# 3. Switch Nginx
sudo ln -sf /etc/nginx/sites-available/green /etc/nginx/sites-enabled/active
sudo nginx -t && sudo nginx -s reload

# 4. Stop blue
pm2 stop ecosystem.blue.config.js
```

---

## 🌍 Environment Variables (Production)

```env
# Production .env
NODE_ENV=production
PORT=5000

# Database (use connection string)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=super-secret-production-key-min-32-chars
CORS_ORIGIN=https://yourdomain.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+972xxxxxxxxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Scaling
CLUSTER_MODE=true
WORKERS=4
```

---

## ✅ Pre-Deployment Checklist

- [ ] כל ה-tests עוברים
- [ ] משתני סביבה מוגדרים
- [ ] SSL מוגדר
- [ ] Backups אוטומטיים פועלים
- [ ] Monitoring מוגדר
- [ ] Rate limiting מוגדר
- [ ] CORS מוגדר נכון
- [ ] Secrets לא בקוד
- [ ] Database migrations רצו
- [ ] Health check endpoint עובד

---

## 🆘 Rollback Plan

```bash
# 1. Tag the working version
git tag -a v1.0.0 -m "Working version"

# 2. If deployment fails, rollback
git checkout v1.0.0
npm run build
pm2 restart all

# 3. Restore database if needed
pg_restore -U postgres -d arrival_confirmation backup.sql
```

---

## 📞 Support

- 📖 Documentation: [INSTALLATION.md](./INSTALLATION.md)
- 🏗️ Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🐛 Issues: GitHub Issues

