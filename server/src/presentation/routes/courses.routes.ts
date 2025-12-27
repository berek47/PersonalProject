import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { CourseRepositoryImpl } from '../../infrastructure/database/repositories/course.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const courseRepository = new CourseRepositoryImpl(prisma);
const coursesController = new CoursesController(courseRepository);

router.get('/', coursesController.getAllCourses);
router.get('/my-courses', authenticate, coursesController.getInstructorCourses);
router.get('/:id', coursesController.getCourseById);
router.get('/slug/:slug', coursesController.getCourseBySlug);
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createRateLimiter, coursesController.createCourse);
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), coursesController.updateCourse);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), coursesController.deleteCourse);

export default router;
