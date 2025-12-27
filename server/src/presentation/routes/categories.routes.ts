import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { CategoryRepositoryImpl } from '../../infrastructure/database/repositories/category.repository.impl';
import { prisma } from '../../infrastructure/database/prisma.service';

const router = Router();
const categoryRepository = new CategoryRepositoryImpl(prisma);
const categoriesController = new CategoriesController(categoryRepository);

router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/slug/:slug', categoriesController.getCategoryBySlug);
router.post('/', authenticate, authorize('ADMIN'), createRateLimiter, categoriesController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), categoriesController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), categoriesController.deleteCategory);

export default router;
