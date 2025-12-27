import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../../domain/repositories/category.repository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../../domain/entities/category.entity';
import { slugify } from '../../../shared/utils/slugify';

export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCategoryDTO): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async findAll(page: number, limit: number): Promise<{ categories: Category[]; total: number }> {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count(),
    ]);

    return { categories, total };
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
