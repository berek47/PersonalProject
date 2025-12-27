import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IReviewRepository } from '../../domain/repositories/review.repository';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError, UnauthorizedError } from '../../shared/errors/app-error';
import { parsePaginationParams, createPaginatedResponse } from '../../shared/utils/pagination';
import { AuthRequest } from '../middleware/auth.middleware';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5').optional(),
  comment: z.string().optional(),
});

export class ReviewsController {
  constructor(
    private reviewRepository: IReviewRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private courseRepository: ICourseRepository
  ) {}

  getCourseReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const { reviews, total } = await this.reviewRepository.findByCourse(courseId, page, limit);
      const averageRating = await this.reviewRepository.getAverageRating(courseId);

      const response = createPaginatedResponse(reviews, total, page, limit);

      res.json({
        success: true,
        ...response,
        averageRating,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await this.reviewRepository.findById(id);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      res.json({
        success: true,
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  };

  createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { courseId } = req.params;
      const validatedData = createReviewSchema.parse(req.body);

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is enrolled in the course
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        req.user.userId,
        courseId
      );

      if (!enrollment) {
        throw new ForbiddenError('You must be enrolled in this course to leave a review');
      }

      // Check if user already reviewed the course
      const existingReview = await this.reviewRepository.findByUserAndCourse(
        req.user.userId,
        courseId
      );

      if (existingReview) {
        throw new ConflictError('You have already reviewed this course');
      }

      const review = await this.reviewRepository.create({
        ...validatedData,
        userId: req.user.userId,
        courseId,
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const validatedData = updateReviewSchema.parse(req.body);

      const review = await this.reviewRepository.findById(id);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      // Only the review author can update it
      if (review.userId !== req.user.userId) {
        throw new ForbiddenError('You do not have permission to update this review');
      }

      const updatedReview = await this.reviewRepository.update(id, validatedData);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review: updatedReview },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const review = await this.reviewRepository.findById(id);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      // Only the review author or admin can delete it
      if (review.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to delete this review');
      }

      await this.reviewRepository.delete(id);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
