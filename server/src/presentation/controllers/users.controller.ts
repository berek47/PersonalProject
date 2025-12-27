import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { parsePaginationParams, createPaginatedResponse } from '../../shared/utils/pagination';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
});

export class UsersController {
  constructor(private userRepository: IUserRepository) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const { users, total } = await this.userRepository.findAll(page, limit);

      const response = createPaginatedResponse(users, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
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

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await this.userRepository.update(id, validatedData);

      res.json({
        success: true,
        message: 'User updated successfully',
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

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.userRepository.delete(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
