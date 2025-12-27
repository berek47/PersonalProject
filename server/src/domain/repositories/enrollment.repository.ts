import { Enrollment, CreateEnrollmentDTO, UpdateEnrollmentDTO, EnrollmentWithDetails } from '../entities/enrollment.entity';

export interface IEnrollmentRepository {
  create(data: CreateEnrollmentDTO): Promise<Enrollment>;
  findById(id: string): Promise<EnrollmentWithDetails | null>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  findByUser(userId: string, page: number, limit: number): Promise<{ enrollments: EnrollmentWithDetails[]; total: number }>;
  findByCourse(courseId: string, page: number, limit: number): Promise<{ enrollments: EnrollmentWithDetails[]; total: number }>;
  update(id: string, data: UpdateEnrollmentDTO): Promise<Enrollment>;
  delete(id: string): Promise<void>;
}
