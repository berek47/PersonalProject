export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedAt?: Date | null;
  enrolledAt: Date;
}

export interface CreateEnrollmentDTO {
  userId: string;
  courseId: string;
}

export interface UpdateEnrollmentDTO {
  progress?: number;
  completedAt?: Date;
}

export interface EnrollmentWithDetails extends Enrollment {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
  };
}
