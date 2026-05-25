import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    } catch {
      // Optional auth — ignore errors
    }
  }
  next();
}
