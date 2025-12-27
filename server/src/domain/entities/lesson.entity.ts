export interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string | null;
  duration: number;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonDTO {
  title: string;
  slug?: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  courseId: string;
}

export interface UpdateLessonDTO {
  title?: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
}
