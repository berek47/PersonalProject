export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  completedAt?: Date | null;
  enrolledAt: Date;
}

export interface CreateEnrollmentDTO {
  userId: string;
  courseId: string;
}

export interface UpdateEnrollmentDTO {
  progressPercent?: number;
  completedAt?: Date;
}

export interface EnrollmentWithDetails extends Enrollment {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
  };
}
