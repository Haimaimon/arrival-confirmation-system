/**
 * Presentation Layer - Auth Routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateMiddleware } from '../middlewares/validationMiddleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  // Public routes
  router.post('/login', validateMiddleware(loginSchema), controller.login);
  router.post('/register', validateMiddleware(registerSchema), controller.register);

  // Protected routes
  router.get('/me', authMiddleware, controller.me);

  return router;
}

