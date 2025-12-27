import { PrismaClient } from '@prisma/client';
import { ILessonRepository } from '../../../domain/repositories/lesson.repository';
import { Lesson, CreateLessonDTO, UpdateLessonDTO } from '../../../domain/entities/lesson.entity';
import { slugify } from '../../../shared/utils/slugify';

export class LessonRepositoryImpl implements ILessonRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateLessonDTO): Promise<Lesson> {
    // Get the last lesson order for this course
    const lastLesson = await this.prisma.lesson.findFirst({
      where: { courseId: data.courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = data.order !== undefined ? data.order : (lastLesson?.order ?? -1) + 1;

    return this.prisma.lesson.create({
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title),
        content: data.content,
        videoUrl: data.videoUrl,
        duration: data.duration || 0,
        order,
        courseId: data.courseId,
      },
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  async findBySlug(courseId: string, slug: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
    });
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: UpdateLessonDTO): Promise<Lesson> {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id },
    });
  }

  async reorder(courseId: string, lessonOrders: { id: string; order: number }[]): Promise<void> {
    await this.prisma.$transaction(
      lessonOrders.map((lesson) =>
        this.prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: lesson.order },
        })
      )
    );
  }
}
