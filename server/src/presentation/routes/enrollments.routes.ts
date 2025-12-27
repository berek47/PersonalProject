import { Router } from 'express';
import { EnrollmentsController } from '../controllers/enrollments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { EnrollmentRepositoryImpl } from '../../infrastructure/database/repositories/enrollment.repository.impl';
import { CourseRepositoryImpl } from '../../infrastructure/database/repositories/course.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const enrollmentRepository = new EnrollmentRepositoryImpl(prisma);
const courseRepository = new CourseRepositoryImpl(prisma);
const enrollmentsController = new EnrollmentsController(enrollmentRepository, courseRepository);

router.get('/my-enrollments', authenticate, enrollmentsController.getUserEnrollments);
router.get('/course/:courseId', authenticate, enrollmentsController.getCourseEnrollments);
router.get('/:id', authenticate, enrollmentsController.getEnrollmentById);
router.post('/', authenticate, createRateLimiter, enrollmentsController.createEnrollment);
router.put('/:id', authenticate, enrollmentsController.updateEnrollment);
router.delete('/:id', authenticate, enrollmentsController.deleteEnrollment);

export default router;
