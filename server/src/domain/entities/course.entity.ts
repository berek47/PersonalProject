// Course status is now a string in the database
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number | any; // Decimal in DB
  difficulty: string;
  status: string;
  instructorId: string;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  title: string;
  slug?: string;
  description: string;
  thumbnail?: string;
  price?: number;
  difficulty?: Difficulty;
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
  difficulty?: Difficulty;
  status?: CourseStatus;
  categoryId?: string;
}

export interface CourseWithDetails extends Course {
  instructor: {
    id: string;
    name: string;
    image?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
}
