// Use Prisma's CourseStatus directly to avoid type mismatches
import { CourseStatus } from '@prisma/client';
export { CourseStatus };

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  status: CourseStatus;
  instructorId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  title: string;
  slug?: string;
  description: string;
  thumbnail?: string;
  price?: number;
  status?: CourseStatus;
  instructorId: string;
  categoryId: string;
}

export interface UpdateCourseDTO {
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  status?: CourseStatus;
  categoryId?: string;
}

export interface CourseWithDetails extends Course {
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
}
