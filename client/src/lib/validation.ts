import z from "zod";

// ==================== AUTH SCHEMAS ====================

export const passwordSchema = z
  .string()
  .min(1, { message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });

// ==================== COURSE SCHEMAS ====================

export const COURSE_DIFFICULTY = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const COURSE_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(5000, { message: "Description must be less than 5000 characters" }),
  categoryId: z.string().optional().nullable(),
  difficulty: z.enum(COURSE_DIFFICULTY, {
    message: "Please select a valid difficulty level",
  }),
  price: z
    .number()
    .min(0, { message: "Price cannot be negative" })
    .max(9999.99, { message: "Price cannot exceed 9999.99" }),
  thumbnail: z.string().url({ message: "Please enter a valid URL" }).optional().nullable(),
});

export type CreateCourseValues = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;

export const publishCourseSchema = z.object({
  courseId: z.string().min(1, { message: "Course ID is required" }),
});

// ==================== LESSON SCHEMAS ====================

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  videoUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullable()
    .or(z.literal("")),
  duration: z
    .number()
    .min(0, { message: "Duration cannot be negative" })
    .max(600, { message: "Duration cannot exceed 600 minutes" }),
  order: z.number().min(1, { message: "Order must be at least 1" }),
});

export type CreateLessonValues = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = createLessonSchema.partial();

export type UpdateLessonValues = z.infer<typeof updateLessonSchema>;

// ==================== CATEGORY SCHEMAS ====================

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  description: z
    .string()
    .max(200, { message: "Description must be less than 200 characters" })
    .optional()
    .nullable(),
});

export type CategoryValues = z.infer<typeof categorySchema>;

// ==================== REVIEW SCHEMAS ====================

export const createReviewSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot exceed 5" }),
  comment: z
    .string()
    .max(1000, { message: "Review must be less than 1000 characters" })
    .optional(),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = createReviewSchema.partial();

export type UpdateReviewValues = z.infer<typeof updateReviewSchema>;

// ==================== ENROLLMENT SCHEMAS ====================

export const enrollmentSchema = z.object({
  courseId: z.string().min(1, { message: "Course ID is required" }),
});

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;

// ==================== PAGINATION & FILTER SCHEMAS ====================

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(12),
});

export type PaginationValues = z.infer<typeof paginationSchema>;

export const courseFiltersSchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(COURSE_DIFFICULTY).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().max(9999).optional(),
  search: z.string().optional(),
  status: z.enum(COURSE_STATUS).optional(),
});

export type CourseFiltersValues = z.infer<typeof courseFiltersSchema>;

// ==================== USER MANAGEMENT SCHEMAS ====================

export const USER_ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  role: z.enum(USER_ROLES, {
    message: "Please select a valid role",
  }),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;

// ==================== PROGRESS SCHEMAS ====================

export const markLessonCompleteSchema = z.object({
  lessonId: z.string().min(1, { message: "Lesson ID is required" }),
});

export type MarkLessonCompleteValues = z.infer<typeof markLessonCompleteSchema>;
