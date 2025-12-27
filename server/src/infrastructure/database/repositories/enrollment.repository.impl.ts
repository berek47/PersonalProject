import { PrismaClient } from '@prisma/client';
import { IEnrollmentRepository } from '../../../domain/repositories/enrollment.repository';
import { Enrollment, CreateEnrollmentDTO, UpdateEnrollmentDTO, EnrollmentWithDetails } from '../../../domain/entities/enrollment.entity';

export class EnrollmentRepositoryImpl implements IEnrollmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEnrollmentDTO): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
      },
    });
  }

  async findById(id: string): Promise<EnrollmentWithDetails | null> {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    }) as Promise<EnrollmentWithDetails | null>;
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  async findByUser(userId: string, page: number, limit: number): Promise<{ enrollments: EnrollmentWithDetails[]; total: number }> {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where: { userId } }),
    ]);

    return { enrollments: enrollments as EnrollmentWithDetails[], total };
  }

  async findByCourse(courseId: string, page: number, limit: number): Promise<{ enrollments: EnrollmentWithDetails[]; total: number }> {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { courseId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where: { courseId } }),
    ]);

    return { enrollments: enrollments as EnrollmentWithDetails[], total };
  }

  async update(id: string, data: UpdateEnrollmentDTO): Promise<Enrollment> {
    return this.prisma.enrollment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.enrollment.delete({
      where: { id },
    });
  }
}
