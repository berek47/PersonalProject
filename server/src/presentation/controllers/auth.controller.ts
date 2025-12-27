import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UnauthorizedError } from '../../shared/errors/app-error';
import { AuthRequest } from '../middleware/auth.middleware';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
});

export class AuthController {
  constructor(private userRepository: IUserRepository) {}

  // Get current user profile (authenticated via better-auth session)
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Update user profile
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedData = updateProfileSchema.parse(req.body);

      const updatedUser = await this.userRepository.update(req.user.userId, validatedData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            image: updatedUser.image,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
