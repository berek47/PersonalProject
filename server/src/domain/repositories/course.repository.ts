import { Course, CreateCourseDTO, UpdateCourseDTO, CourseWithDetails, CourseStatus } from '../entities/course.entity';

export interface ICourseRepository {
  create(data: CreateCourseDTO): Promise<Course>;
  findById(id: string): Promise<CourseWithDetails | null>;
  findBySlug(slug: string): Promise<CourseWithDetails | null>;
  findAll(filters: {
    page: number;
    limit: number;
    status?: CourseStatus;
    categoryId?: string;
    instructorId?: string;
    search?: string;
  }): Promise<{ courses: CourseWithDetails[]; total: number }>;
  update(id: string, data: UpdateCourseDTO): Promise<Course>;
  delete(id: string): Promise<void>;
  findByInstructor(instructorId: string, page: number, limit: number): Promise<{ courses: CourseWithDetails[]; total: number }>;
}
