import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../shared/errors/app-error';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../../domain/entities/user.entity';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export class AuthController {
  constructor(private userRepository: IUserRepository) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await this.userRepository.create({
        ...validatedData,
        password: hashedPassword,
        role: validatedData.role as UserRole || UserRole.STUDENT,
      });

      // Generate JWT
      const token = JwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await this.userRepository.findByEmail(validatedData.email);
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate JWT
      const token = JwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('token');
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

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
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

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
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedData = changePasswordSchema.parse(req.body);

      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update password
      await this.userRepository.updatePassword(user.id, hashedPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
