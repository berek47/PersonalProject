import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rate-limit.middleware';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/user.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const userRepository = new UserRepositoryImpl(prisma);
const authController = new AuthController(userRepository);

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

export default router;
