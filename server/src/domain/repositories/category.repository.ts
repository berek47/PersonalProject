import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/category.entity';

export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(page: number, limit: number): Promise<{ categories: Category[]; total: number }>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}
