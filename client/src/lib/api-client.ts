const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies for auth
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "Something went wrong", data.details);
  }

  return data;
}

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", { method: "POST", body: data }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),
};

// Categories API
export const categoriesApi = {
  getAll: () => request<{ data: Category[] }>("/categories"),

  getById: (id: string) => request<{ data: Category }>(`/categories/${id}`),

  create: (data: { name: string; description?: string }) =>
    request<{ data: Category }>("/categories", { method: "POST", body: data }),

  update: (id: string, data: { name?: string; description?: string }) =>
    request<{ data: Category }>(`/categories/${id}`, { method: "PATCH", body: data }),

  delete: (id: string) => request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),
};

// Courses API
export const coursesApi = {
  getAll: (params?: { search?: string; categoryId?: string; difficulty?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return request<PaginatedResponse<Course>>(`/courses${query ? `?${query}` : ""}`);
  },

  getBySlug: (slug: string) =>
    request<{ data: CourseWithDetails }>(`/courses/slug/${slug}`),

  getInstructorCourses: () =>
    request<{ data: Course[] }>("/courses/instructor/my-courses"),

  getById: (id: string) =>
    request<{ data: Course }>(`/courses/instructor/${id}`),

  create: (data: CreateCourseData) =>
    request<{ data: Course }>("/courses", { method: "POST", body: data }),

  update: (id: string, data: Partial<CreateCourseData>) =>
    request<{ data: Course }>(`/courses/${id}`, { method: "PATCH", body: data }),

  publish: (id: string) =>
    request<{ data: Course }>(`/courses/${id}/publish`, { method: "POST" }),

  archive: (id: string) =>
    request<{ data: Course }>(`/courses/${id}/archive`, { method: "POST" }),

  delete: (id: string) =>
    request<{ message: string }>(`/courses/${id}`, { method: "DELETE" }),
};

// Lessons API
export const lessonsApi = {
  getByCourse: (courseSlug: string) =>
    request<{ data: LessonBasic[] }>(`/lessons/course/${courseSlug}`),

  getBySlug: (courseSlug: string, lessonSlug: string) =>
    request<{ data: Lesson }>(`/lessons/course/${courseSlug}/${lessonSlug}`),

  getForInstructor: (courseId: string) =>
    request<{ data: Lesson[] }>(`/lessons/instructor/course/${courseId}`),

  getById: (id: string) =>
    request<{ data: Lesson }>(`/lessons/instructor/${id}`),

  create: (courseId: string, data: CreateLessonData) =>
    request<{ data: Lesson }>(`/lessons/course/${courseId}`, { method: "POST", body: data }),

  update: (id: string, data: Partial<CreateLessonData>) =>
    request<{ data: Lesson }>(`/lessons/${id}`, { method: "PATCH", body: data }),

  reorder: (courseId: string, lessonIds: string[]) =>
    request<{ message: string }>(`/lessons/course/${courseId}/reorder`, {
      method: "POST",
      body: { lessonIds },
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/lessons/${id}`, { method: "DELETE" }),

  markComplete: (id: string) =>
    request<{ message: string }>(`/lessons/${id}/complete`, { method: "POST" }),
};

// Enrollments API
export const enrollmentsApi = {
  getMyEnrollments: () =>
    request<{ data: EnrollmentWithCourse[] }>("/enrollments/my-enrollments"),

  getStatus: (courseSlug: string) =>
    request<{ data: { isEnrolled: boolean; enrollment: Enrollment | null } }>(
      `/enrollments/status/${courseSlug}`
    ),

  getDetails: (id: string) =>
    request<{ data: EnrollmentWithProgress }>(`/enrollments/${id}`),

  getCertificate: (id: string) =>
    request<{ data: Certificate }>(`/enrollments/${id}/certificate`),

  enroll: (courseSlug: string) =>
    request<{ data: Enrollment }>(`/enrollments/enroll/${courseSlug}`, { method: "POST" }),

  unenroll: (courseSlug: string) =>
    request<{ message: string }>(`/enrollments/unenroll/${courseSlug}`, { method: "DELETE" }),

  getCourseEnrollments: (courseId: string) =>
    request<{ data: EnrollmentWithUser[] }>(`/enrollments/course/${courseId}`),
};

// Reviews API
export const reviewsApi = {
  getByCourse: (courseSlug: string, params?: { cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return request<PaginatedResponse<ReviewWithUser> & { averageRating: number; total: number }>(
      `/reviews/course/${courseSlug}${query ? `?${query}` : ""}`
    );
  },

  getMyReview: (courseSlug: string) =>
    request<{ data: Review | null }>(`/reviews/my-review/${courseSlug}`),

  create: (courseSlug: string, data: { rating: number; comment?: string }) =>
    request<{ data: Review }>(`/reviews/course/${courseSlug}`, { method: "POST", body: data }),

  update: (id: string, data: { rating?: number; comment?: string }) =>
    request<{ data: Review }>(`/reviews/${id}`, { method: "PATCH", body: data }),

  delete: (id: string) =>
    request<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),
};

// Users API (Admin)
export const usersApi = {
  getProfile: () => request<{ data: User }>("/users/profile"),

  updateProfile: (data: { name?: string; image?: string }) =>
    request<{ data: User }>("/users/profile", { method: "PATCH", body: data }),

  getAll: (params?: { search?: string; role?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role) searchParams.set("role", params.role);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return request<PaginatedResponse<User> & { total: number }>(`/users${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => request<{ data: User }>(`/users/${id}`),

  updateRole: (id: string, role: "ADMIN" | "INSTRUCTOR" | "STUDENT") =>
    request<{ data: User }>(`/users/${id}/role`, { method: "PATCH", body: { role } }),

  delete: (id: string) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),

  getStats: () => request<{ data: UserStats }>("/users/stats"),
};

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { courses: number };
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  instructorId: string;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  instructor?: { id: string; name: string; image?: string | null };
  category?: { id: string; name: string; slug: string };
  _count?: { lessons: number; enrollments: number };
};

export type CourseWithDetails = Course & {
  reviews: ReviewWithUser[];
  averageRating: number;
};

export type CreateCourseData = {
  title: string;
  description: string;
  categoryId?: string | null;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price?: number;
  thumbnail?: string | null;
};

export type LessonBasic = {
  id: string;
  title: string;
  slug: string;
  duration?: number | null;
  order: number;
};

export type Lesson = LessonBasic & {
  content: string;
  videoUrl?: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
};

export type CreateLessonData = {
  title: string;
  content: string;
  videoUrl?: string | null;
  duration?: number | null;
  order?: number;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type EnrollmentWithCourse = Enrollment & {
  course: Course;
};

export type EnrollmentWithUser = Enrollment & {
  user: { id: string; name: string; email: string; image?: string | null };
};

export type EnrollmentWithProgress = Enrollment & {
  course: Course;
  lessonProgress: { lessonId: string; completed: boolean; completedAt?: string | null }[];
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewWithUser = Review & {
  user: { id: string; name: string; image?: string | null };
};

export type Certificate = {
  enrollmentId: string;
  courseName?: string;
  userName: string;
  completedAt: string;
  progress: number;
};

export type UserStats = {
  total: number;
  byRole: { role: string; count: number }[];
  recentUsers: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export { ApiError };
