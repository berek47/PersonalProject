import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import categoriesRoutes from './categories.routes';
import coursesRoutes from './courses.routes';
import lessonsRoutes from './lessons.routes';
import enrollmentsRoutes from './enrollments.routes';
import reviewsRoutes from './reviews.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/reviews', reviewsRoutes);

export default router;
