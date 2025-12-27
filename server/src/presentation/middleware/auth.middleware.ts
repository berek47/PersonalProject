import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error';
import { UserRole } from '../../domain/entities/user.entity';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = JwtService.verify(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
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
