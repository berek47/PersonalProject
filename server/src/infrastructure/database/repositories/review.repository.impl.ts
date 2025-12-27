import { PrismaClient } from '@prisma/client';
import { IReviewRepository } from '../../../domain/repositories/review.repository';
import { Review, CreateReviewDTO, UpdateReviewDTO, ReviewWithDetails } from '../../../domain/entities/review.entity';

export class ReviewRepositoryImpl implements IReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReviewDTO): Promise<Review> {
    return this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.userId,
        courseId: data.courseId,
      },
    });
  }

  async findById(id: string): Promise<ReviewWithDetails | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    }) as Promise<ReviewWithDetails | null>;
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  async findByCourse(courseId: string, page: number, limit: number): Promise<{ reviews: ReviewWithDetails[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { courseId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { courseId } }),
    ]);

    return { reviews: reviews as ReviewWithDetails[], total };
  }

  async update(id: string, data: UpdateReviewDTO): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRating(courseId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }
}
