import { Router } from 'express';
import { LessonsController } from '../controllers/lessons.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { LessonRepositoryImpl } from '../../infrastructure/database/repositories/lesson.repository.impl';
import { CourseRepositoryImpl } from '../../infrastructure/database/repositories/course.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const lessonRepository = new LessonRepositoryImpl(prisma);
const courseRepository = new CourseRepositoryImpl(prisma);
const lessonsController = new LessonsController(lessonRepository, courseRepository);

router.get('/course/:courseId', lessonsController.getCourseLessons);
router.get('/:id', lessonsController.getLessonById);
router.get('/course/:courseId/slug/:slug', lessonsController.getLessonBySlug);
router.post('/course/:courseId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createRateLimiter, lessonsController.createLesson);
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), lessonsController.updateLesson);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), lessonsController.deleteLesson);
router.put('/course/:courseId/reorder', authenticate, authorize('INSTRUCTOR', 'ADMIN'), lessonsController.reorderLessons);

export default router;
