/**
 * Presentation Layer - WebSocket Real-time Server
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { JWTService } from '../../infrastructure/security/JWTService';

export interface RealtimeEventPayload {
  type: string;
  data: any;
}

export class RealtimeServer {
  private io: Server;
  private jwtService: JWTService;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.jwtService = JWTService.getInstance();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const payload = this.jwtService.verifyToken(token);
        (socket as any).user = payload;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);
      const user = (socket as any).user;

      // Join event room
      socket.on('join:event', (eventId: string) => {
        socket.join(`event:${eventId}`);
        console.log(`User ${user.userId} joined event ${eventId}`);
      });

      // Leave event room
      socket.on('leave:event', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        console.log(`User ${user.userId} left event ${eventId}`);
      });

      // Heartbeat
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit to specific event room
  emitToEvent(eventId: string, event: string, data: any) {
    this.io.to(`event:${eventId}`).emit(event, data);
  }

  // Emit guest confirmation update
  emitGuestConfirmed(eventId: string, guestData: any) {
    this.emitToEvent(eventId, 'guest:confirmed', guestData);
  }

  // Emit guest declined update
  emitGuestDeclined(eventId: string, guestData: any) {
    this.emitToEvent(eventId, 'guest:declined', guestData);
  }

  // Emit statistics update
  emitStatsUpdate(eventId: string, stats: any) {
    this.emitToEvent(eventId, 'stats:update', stats);
  }

  // Emit notification sent
  emitNotificationSent(eventId: string, notificationData: any) {
    this.emitToEvent(eventId, 'notification:sent', notificationData);
  }

  // Emit table updated
  emitTableUpdated(eventId: string, tableData: any) {
    this.emitToEvent(eventId, 'table:updated', tableData);
  }

  getIO(): Server {
    return this.io;
  }
}

