import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Better-auth uses this cookie name by default
const SESSION_COOKIE_NAME = 'better-auth.session_token';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get session token from cookies
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      throw new UnauthorizedError('Authentication required');
    }

    // Look up session in database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            banned: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid session');
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      throw new UnauthorizedError('Session expired');
    }

    // Check if user is banned
    if (session.user.banned) {
      throw new UnauthorizedError('Your account has been banned');
    }

    // Attach user to request
    req.user = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
