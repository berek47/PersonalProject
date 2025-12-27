import { PrismaClient } from '@prisma/client';
import { ICourseRepository } from '../../../domain/repositories/course.repository';
import { Course, CreateCourseDTO, UpdateCourseDTO, CourseWithDetails, CourseStatus } from '../../../domain/entities/course.entity';
import { slugify } from '../../../shared/utils/slugify';

export class CourseRepositoryImpl implements ICourseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCourseDTO): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title),
        description: data.description,
        thumbnail: data.thumbnail,
        price: data.price || 0,
        status: data.status || 'DRAFT',
        instructorId: data.instructorId,
        categoryId: data.categoryId,
      },
    });
  }

  async findById(id: string): Promise<CourseWithDetails | null> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    }) as Promise<CourseWithDetails | null>;
  }

  async findBySlug(slug: string): Promise<CourseWithDetails | null> {
    return this.prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    }) as Promise<CourseWithDetails | null>;
  }

  async findAll(filters: {
    page: number;
    limit: number;
    status?: CourseStatus;
    categoryId?: string;
    instructorId?: string;
    search?: string;
  }): Promise<{ courses: CourseWithDetails[]; total: number }> {
    const skip = (filters.page - 1) * filters.limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.instructorId) {
      where.instructorId = filters.instructorId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: filters.limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { courses: courses as CourseWithDetails[], total };
  }

  async update(id: string, data: UpdateCourseDTO): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({
      where: { id },
    });
  }

  async findByInstructor(instructorId: string, page: number, limit: number): Promise<{ courses: CourseWithDetails[]; total: number }> {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { instructorId },
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where: { instructorId } }),
    ]);

    return { courses: courses as CourseWithDetails[], total };
  }
}
