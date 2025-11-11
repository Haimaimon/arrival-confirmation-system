/**
 * Main Entry Point - Bootstraps the application
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { createDatabaseConnection } from './infrastructure/database/connection';
import { RedisCacheService } from './infrastructure/services/RedisCacheService';
import { TwilioNotificationService } from './infrastructure/services/TwilioNotificationService';
import { GuestTokenService } from './infrastructure/services/GuestTokenService';
import { GreenApiWhatsAppService } from './infrastructure/services/GreenApiWhatsAppService';
import { PostgresGuestRepository } from './infrastructure/database/PostgresGuestRepository';
import { PostgresEventRepository } from './infrastructure/database/PostgresEventRepository';
import { PostgresNotificationRepository } from './infrastructure/database/PostgresNotificationRepository';
import { PostgresTableRepository } from './infrastructure/database/PostgresTableRepository';
import { GuestController } from './presentation/controllers/GuestController';
import { EventController } from './presentation/controllers/EventController';
import { AuthController } from './presentation/controllers/AuthController';
import { NotificationController } from './presentation/controllers/NotificationController';
import { TestController } from './presentation/controllers/TestController';
import { TableController } from './presentation/controllers/TableController';
import { GuestInvitationController } from './presentation/controllers/GuestInvitationController';
import { MonitoringController } from './presentation/controllers/MonitoringController';
import { createGuestRoutes } from './presentation/routes/guestRoutes';
import { createEventRoutes } from './presentation/routes/eventRoutes';
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { createNotificationRoutes } from './presentation/routes/notificationRoutes';
import { createTestRoutes } from './presentation/routes/testRoutes';
import { createTableRoutes } from './presentation/routes/tableRoutes';
import { createGuestInvitationRoutes } from './presentation/routes/guestInvitationRoutes';
import { createMonitoringRoutes } from './presentation/routes/monitoringRoutes';
import { RealtimeServer } from './presentation/websocket/RealtimeServer';
import { errorMiddleware, notFoundMiddleware } from './presentation/middlewares/errorMiddleware';
import { generalLimiter } from './presentation/middlewares/rateLimitMiddleware';
import { performanceMiddleware, requestSizeMiddleware } from './presentation/middlewares/performanceMiddleware';
import { logger } from './infrastructure/services/LoggerService';

// Load environment variables with environment-specific files
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// פיתוח: טען קובץ .env.development מתוך המקור
if (NODE_ENV !== 'production') {
  const devEnvPath = path.resolve(__dirname, '../.env.development');
  if (fs.existsSync(devEnvPath)) {
    dotenv.config({ path: devEnvPath });
    console.log(`📄 Loaded development env from .env.development`);
  } else {
    dotenv.config(); // טען .env אם קיים
    console.log(`📄 Loaded env from .env (fallback)`);
  }
// פרודקשן: אל תטען קבצים — Render מספק process.env
} else {
  console.log('🏭 Production mode – using process.env from Render');
}
// Initialize Express app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Performance monitoring
app.use(performanceMiddleware);
app.use(requestSizeMiddleware);

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize services
async function bootstrap() {
  try {
    // Database connection
    const dbConnection = createDatabaseConnection();
    const isDbConnected = await dbConnection.testConnection();
    
    if (!isDbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Cache service
    const cacheService = new RedisCacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });
    await cacheService.connect();

    // Notification service
    const notificationService = new TwilioNotificationService();

    // WhatsApp service
    const whatsAppService = new GreenApiWhatsAppService();

    // Guest token service
    const guestTokenService = new GuestTokenService();

    // Repositories
    const guestRepository = new PostgresGuestRepository(dbConnection.getPool());
    const eventRepository = new PostgresEventRepository(dbConnection.getPool());
    const notificationRepository = new PostgresNotificationRepository(dbConnection.getPool());
    const tableRepository = new PostgresTableRepository(dbConnection.getPool());

    // TODO: Initialize other repositories (User)

    // Controllers
    const guestController = new GuestController(
      guestRepository,
      eventRepository,
      cacheService
    );

    const eventController = new EventController(
      eventRepository,
      guestRepository,
      cacheService
    );

    const authController = new AuthController();

    const notificationController = new NotificationController(
      guestRepository,
      notificationRepository,
      notificationService
    );

    const testController = new TestController();

    const tableController = new TableController(
      tableRepository,
      guestRepository,
      eventRepository,
      cacheService
    );

    const guestInvitationController = new GuestInvitationController(
      guestRepository,
      eventRepository,
      guestTokenService,
      whatsAppService,
      cacheService
    );

    const monitoringController = new MonitoringController(
      dbConnection,
      cacheService
    );

    // Routes
    const apiRouter = express.Router();
    apiRouter.use('/auth', createAuthRoutes(authController));
    apiRouter.use('/guests', createGuestRoutes(guestController));
    apiRouter.use('/events', createEventRoutes(eventController));
    apiRouter.use('/notifications', createNotificationRoutes(notificationController));
    apiRouter.use('/tables', createTableRoutes(tableController));
    apiRouter.use('/invitations', createGuestInvitationRoutes(guestInvitationController)); // Public guest invitations
    apiRouter.use('/monitoring', createMonitoringRoutes(monitoringController)); // System monitoring & health
    apiRouter.use('/test', createTestRoutes(testController)); // Test routes for development

    app.use('/api/v1', apiRouter);

    // WebSocket server
    new RealtimeServer(httpServer);
    console.log('WebSocket server initialized');

    // Error handling
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    // Start server
    httpServer.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/monitoring/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/api/v1/monitoring/metrics`);
      console.log(`✅ Production Ready Check: http://localhost:${PORT}/api/v1/monitoring/production-ready`);
      console.log('='.repeat(60));
      console.log('📊 Performance monitoring: ENABLED');
      console.log('🗄️ Database query logging: ENABLED');
      console.log('💾 Cache operation logging: ENABLED');
      console.log('📝 Log files: ./logs/');
      console.log('='.repeat(60) + '\n');

      logger.info('🎉 Server initialized successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('🛑 SIGTERM received, shutting down gracefully...');
      console.log('\n' + '='.repeat(60));
      console.log('🛑 Shutting Down Server...');
      console.log('='.repeat(60));
      
      try {
        console.log('💾 Closing cache connections...');
        await cacheService.disconnect();
        logger.info('✅ Cache disconnected');
        
        console.log('🗄️ Closing database connections...');
        await dbConnection.close();
        logger.info('✅ Database disconnected');
        
        console.log('='.repeat(60));
        console.log('✅ Server shut down successfully');
        console.log('='.repeat(60) + '\n');
        
        process.exit(0);
      } catch (error: any) {
        logger.error('❌ Error during shutdown', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to bootstrap application:', error);
    logger.error('Failed to bootstrap application', error as Error);
    process.exit(1);
  }
}

// Start application
bootstrap();

