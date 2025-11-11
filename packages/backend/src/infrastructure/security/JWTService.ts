/**
 * Infrastructure Layer - JWT Authentication Service
 */

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  private static instance: JWTService;
  private secret: string;
  private expiresIn: string;
  private refreshExpiresIn: string;

  private constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  generateTokens(payload: TokenPayload): TokenResponse {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as any);

    const refreshToken = jwt.sign(payload, this.secret, {
      expiresIn: this.refreshExpiresIn,
    } as any);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.expiresIn),
    };
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error: any) {
      throw new Error('Invalid or expired token');
    }
  }

  refreshAccessToken(refreshToken: string): TokenResponse {
    const payload = this.verifyToken(refreshToken);
    return this.generateTokens(payload);
  }

  private parseExpiry(expiry: string): number {
    // Parse expiry string to seconds
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 604800; // 7 days default
    }
  }
}

