import { Lesson, CreateLessonDTO, UpdateLessonDTO } from '../entities/lesson.entity';

export interface ILessonRepository {
  create(data: CreateLessonDTO): Promise<Lesson>;
  findById(id: string): Promise<Lesson | null>;
  findBySlug(courseId: string, slug: string): Promise<Lesson | null>;
  findByCourse(courseId: string): Promise<Lesson[]>;
  update(id: string, data: UpdateLessonDTO): Promise<Lesson>;
  delete(id: string): Promise<void>;
  reorder(courseId: string, lessonOrders: { id: string; order: number }[]): Promise<void>;
}
