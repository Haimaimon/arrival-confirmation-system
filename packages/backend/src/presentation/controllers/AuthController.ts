/**
 * Presentation Layer - Auth Controller (Mock for Development)
 */

import { Request, Response } from 'express';
import { JWTService } from '../../infrastructure/security/JWTService';

export class AuthController {
  private jwtService: JWTService;

  constructor() {
    this.jwtService = JWTService.getInstance();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Mock authentication - TODO: Implement real authentication
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      // Mock user data
      const user = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: email,
        role: 'CLIENT',
      };

      // Generate JWT tokens
      const tokens = this.jwtService.generateTokens(user);

      return res.json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email,
            firstName: 'משתמש',
            lastName: 'דוגמה',
            role: user.role,
          },
          ...tokens,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Mock registration - TODO: Implement real registration
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required',
        });
      }

      // Mock user data
      const user = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: email,
        role: 'CLIENT',
      };

      // Generate JWT tokens
      const tokens = this.jwtService.generateTokens(user);

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            role: user.role,
          },
          ...tokens,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      // Get user from token (set by authMiddleware)
      const authReq = req as any;
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      return res.json({
        success: true,
        data: {
          id: authReq.user.userId,
          email: authReq.user.email,
          role: authReq.user.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

