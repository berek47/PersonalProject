import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ILessonRepository } from '../../domain/repositories/lesson.repository';
import { ICourseRepository } from '../../domain/repositories/course.repository';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../../shared/errors/app-error';
import { AuthRequest } from '../middleware/auth.middleware';

const createLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Lesson content is required'),
  videoUrl: z.string().url().optional(),
  duration: z.number().min(0).optional(),
  order: z.number().min(0).optional(),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().min(0).optional(),
  order: z.number().min(0).optional(),
});

const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      order: z.number().min(0),
    })
  ),
});

export class LessonsController {
  constructor(
    private lessonRepository: ILessonRepository,
    private courseRepository: ICourseRepository
  ) {}

  getCourseLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const lessons = await this.lessonRepository.findByCourse(courseId);

      res.json({
        success: true,
        data: { lessons },
      });
    } catch (error) {
      next(error);
    }
  };

  getLessonById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        throw new NotFoundError('Lesson not found');
      }

      res.json({
        success: true,
        data: { lesson },
      });
    } catch (error) {
      next(error);
    }
  };

  getLessonBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, slug } = req.params;

      const lesson = await this.lessonRepository.findBySlug(courseId, slug);
      if (!lesson) {
        throw new NotFoundError('Lesson not found');
      }

      res.json({
        success: true,
        data: { lesson },
      });
    } catch (error) {
      next(error);
    }
  };

  createLesson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { courseId } = req.params;
      const validatedData = createLessonSchema.parse(req.body);

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to create lessons for this course');
      }

      const lesson = await this.lessonRepository.create({
        ...validatedData,
        courseId,
      });

      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: { lesson },
      });
    } catch (error) {
      next(error);
    }
  };

  updateLesson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const validatedData = updateLessonSchema.parse(req.body);

      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        throw new NotFoundError('Lesson not found');
      }

      const course = await this.courseRepository.findById(lesson.courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to update this lesson');
      }

      const updatedLesson = await this.lessonRepository.update(id, validatedData);

      res.json({
        success: true,
        message: 'Lesson updated successfully',
        data: { lesson: updatedLesson },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLesson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        throw new NotFoundError('Lesson not found');
      }

      const course = await this.courseRepository.findById(lesson.courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to delete this lesson');
      }

      await this.lessonRepository.delete(id);

      res.json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  reorderLessons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { courseId } = req.params;
      const validatedData = reorderLessonsSchema.parse(req.body);

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if user is the instructor or admin
      if (course.instructorId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to reorder lessons for this course');
      }

      await this.lessonRepository.reorder(courseId, validatedData.lessons);

      res.json({
        success: true,
        message: 'Lessons reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
