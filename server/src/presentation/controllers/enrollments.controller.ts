import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { NotFoundError, ConflictError, ForbiddenError, UnauthorizedError } from '../../shared/errors/app-error';
import { parsePaginationParams, createPaginatedResponse } from '../../shared/utils/pagination';
import { AuthRequest } from '../middleware/auth.middleware';

const createEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

const updateEnrollmentSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  completedAt: z.string().datetime().optional(),
});

export class EnrollmentsController {
  constructor(
    private enrollmentRepository: IEnrollmentRepository,
    private courseRepository: ICourseRepository
  ) {}

  getUserEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const { enrollments, total } = await this.enrollmentRepository.findByUser(
        req.user.userId,
        page,
        limit
      );

      const response = createPaginatedResponse(enrollments, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  getCourseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { courseId } = req.params;
      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Only instructor of the course or admin can view all enrollments
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to view course enrollments');
      }

      const { enrollments, total } = await this.enrollmentRepository.findByCourse(
        courseId,
        page,
        limit
      );

      const response = createPaginatedResponse(enrollments, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  getEnrollmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const enrollment = await this.enrollmentRepository.findById(id);
      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      // Check if user is the enrolled student, instructor, or admin
      const course = await this.courseRepository.findById(enrollment.courseId);
      if (
        enrollment.userId !== req.user.userId &&
        course?.instructorId !== req.user.userId &&
        req.user.role !== 'ADMIN'
      ) {
        throw new ForbiddenError('You do not have permission to view this enrollment');
      }

      res.json({
        success: true,
        data: { enrollment },
      });
    } catch (error) {
      next(error);
    }
  };

  createEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedData = createEnrollmentSchema.parse(req.body);

      const course = await this.courseRepository.findById(validatedData.courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if course is published
      if (course.status !== 'PUBLISHED') {
        throw new ForbiddenError('This course is not available for enrollment');
      }

      // Check if already enrolled
      const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
        req.user.userId,
        validatedData.courseId
      );

      if (existingEnrollment) {
        throw new ConflictError('You are already enrolled in this course');
      }

      const enrollment = await this.enrollmentRepository.create({
        userId: req.user.userId,
        courseId: validatedData.courseId,
      });

      res.status(201).json({
        success: true,
        message: 'Enrolled successfully',
        data: { enrollment },
      });
    } catch (error) {
      next(error);
    }
  };

  updateEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const validatedData = updateEnrollmentSchema.parse(req.body);

      const enrollment = await this.enrollmentRepository.findById(id);
      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      // Only the enrolled student can update their progress
      if (enrollment.userId !== req.user.userId) {
        throw new ForbiddenError('You do not have permission to update this enrollment');
      }

      const updateData: any = {};
      if (validatedData.progress !== undefined) {
        updateData.progress = validatedData.progress;
      }
      if (validatedData.completedAt) {
        updateData.completedAt = new Date(validatedData.completedAt);
      }

      const updatedEnrollment = await this.enrollmentRepository.update(id, updateData);

      res.json({
        success: true,
        message: 'Enrollment updated successfully',
        data: { enrollment: updatedEnrollment },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const enrollment = await this.enrollmentRepository.findById(id);
      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      // Only the enrolled student or admin can delete enrollment
      if (enrollment.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to delete this enrollment');
      }

      await this.enrollmentRepository.delete(id);

      res.json({
        success: true,
        message: 'Enrollment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
