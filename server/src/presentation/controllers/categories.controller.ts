import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ICategoryRepository } from '../../domain/repositories/category.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { parsePaginationParams, createPaginatedResponse } from '../../shared/utils/pagination';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export class CategoriesController {
  constructor(private categoryRepository: ICategoryRepository) {}

  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);

      const { categories, total } = await this.categoryRepository.findAll(page, limit);

      const response = createPaginatedResponse(categories, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;

      const category = await this.categoryRepository.findBySlug(slug);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCategorySchema.parse(req.body);

      const category = await this.categoryRepository.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);

      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      const category = await this.categoryRepository.update(id, validatedData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      await this.categoryRepository.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
