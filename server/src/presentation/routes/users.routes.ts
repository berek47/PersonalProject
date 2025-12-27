import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/user.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const userRepository = new UserRepositoryImpl(prisma);
const usersController = new UsersController(userRepository);

router.get('/', authenticate, authorize('ADMIN'), usersController.getAllUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), usersController.updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), usersController.deleteUser);

export default router;
