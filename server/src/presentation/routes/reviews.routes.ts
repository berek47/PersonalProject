import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { ReviewRepositoryImpl } from '../../infrastructure/database/repositories/review.repository.impl';
import { EnrollmentRepositoryImpl } from '../../infrastructure/database/repositories/enrollment.repository.impl';
import { CourseRepositoryImpl } from '../../infrastructure/database/repositories/course.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const reviewRepository = new ReviewRepositoryImpl(prisma);
const enrollmentRepository = new EnrollmentRepositoryImpl(prisma);
const courseRepository = new CourseRepositoryImpl(prisma);
const reviewsController = new ReviewsController(reviewRepository, enrollmentRepository, courseRepository);

router.get('/course/:courseId', reviewsController.getCourseReviews);
router.get('/:id', reviewsController.getReviewById);
router.post('/course/:courseId', authenticate, createRateLimiter, reviewsController.createReview);
router.put('/:id', authenticate, reviewsController.updateReview);
router.delete('/:id', authenticate, reviewsController.deleteReview);

export default router;
