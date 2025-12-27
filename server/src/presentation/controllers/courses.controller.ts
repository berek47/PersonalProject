import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../../shared/errors/app-error';
import { parsePaginationParams, createPaginatedResponse } from '../../shared/utils/pagination';
import { AuthRequest } from '../middleware/auth.middleware';
import { CourseStatus } from '../../domain/entities/course.entity';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Course description is required'),
  thumbnail: z.string().url().optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  categoryId: z.string().optional(),
});

export class CoursesController {
  constructor(private courseRepository: ICourseRepository) {}

  getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
      const status = req.query.status as CourseStatus | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const instructorId = req.query.instructorId as string | undefined;
      const search = req.query.search as string | undefined;

      const { courses, total } = await this.courseRepository.findAll({
        page,
        limit,
        status,
        categoryId,
        instructorId,
        search,
      });

      const response = createPaginatedResponse(courses, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await this.courseRepository.findById(id);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      res.json({
        success: true,
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  };

  getCourseBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;

      const course = await this.courseRepository.findBySlug(slug);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      res.json({
        success: true,
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  };

  getInstructorCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const { courses, total } = await this.courseRepository.findByInstructor(
        req.user.userId,
        page,
        limit
      );

      const response = createPaginatedResponse(courses, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedData = createCourseSchema.parse(req.body);

      const course = await this.courseRepository.create({
        ...validatedData,
        instructorId: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const validatedData = updateCourseSchema.parse(req.body);

      const existingCourse = await this.courseRepository.findById(id);
      if (!existingCourse) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (existingCourse.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to update this course');
      }

      const course = await this.courseRepository.update(id, validatedData);

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const course = await this.courseRepository.findById(id);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to delete this course');
      }

      await this.courseRepository.delete(id);

      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
