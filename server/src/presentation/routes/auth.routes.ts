import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/user.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const userRepository = new UserRepositoryImpl(prisma);
const authController = new AuthController(userRepository);

// Note: Login, register, logout are handled by better-auth on the client
// This server validates better-auth sessions and provides profile endpoints

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
