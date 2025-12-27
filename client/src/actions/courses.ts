"use server";

import { requireInstructor, requireResourceAccess, ROLES } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/get-session";
import { log } from "@/lib/logger";
import { createPaginatedResponse, normalizeLimit } from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { slugify, generateNumericSlug } from "@/lib/slugify";
import {
  createCourseSchema,
  CreateCourseValues,
  updateCourseSchema,
  UpdateCourseValues,
  courseFiltersSchema,
  CourseFiltersValues,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Get published courses with filters and pagination
 */
export async function getCourses(
  filters: CourseFiltersValues = {},
  cursor?: string,
  limit: number = 12
) {
  const validFilters = courseFiltersSchema.parse(filters);
  const normalizedLimit = normalizeLimit(limit);

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (validFilters.category) {
    where.category = { slug: validFilters.category };
  }

  if (validFilters.difficulty) {
    where.difficulty = validFilters.difficulty;
  }

  if (validFilters.priceMin !== undefined || validFilters.priceMax !== undefined) {
    where.price = {};
    if (validFilters.priceMin !== undefined) {
      (where.price as Record<string, unknown>).gte = validFilters.priceMin;
    }
    if (validFilters.priceMax !== undefined) {
      (where.price as Record<string, unknown>).lte = validFilters.priceMax;
    }
  }

  if (validFilters.search) {
    where.OR = [
      { title: { contains: validFilters.search, mode: "insensitive" } },
      { description: { contains: validFilters.search, mode: "insensitive" } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    take: normalizedLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { enrollments: true, reviews: true, lessons: true },
      },
    },
  });

  return createPaginatedResponse(courses, normalizedLimit);
}

/**
 * Get a single course by slug
 */
export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, image: true },
      },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          duration: true,
          order: true,
          isPublished: true,
        },
      },
      _count: {
        select: { enrollments: true, reviews: true, lessons: true },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  return course;
}

/**
 * Get published courses with filters and cursor pagination
 */
export async function getPublishedCourses(options: {
  search?: string;
  categoryId?: string;
  difficulty?: string;
  cursor?: string;
  limit?: number;
}) {
  const { search, categoryId, difficulty, cursor, limit = 12 } = options;
  const normalizedLimit = normalizeLimit(limit);

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    take: normalizedLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { enrollments: true, lessons: true },
      },
    },
  });

  const hasMore = courses.length > normalizedLimit;
  const items = hasMore ? courses.slice(0, -1) : courses;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  // For previous page support
  let prevCursor = null;
  if (cursor && items.length > 0) {
    prevCursor = items[0].id;
  }

  return {
    courses: items,
    nextCursor,
    prevCursor,
    hasMore,
    hasPrevious: !!cursor,
  };
}

/**
 * Get reviews for a course
 */
export async function getCourseReviews(courseId: string) {
  const reviews = await prisma.review.findMany({
    where: { courseId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
}

/**
 * Get course by ID (for editing)
 */
export async function getCourseById(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      lessons: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { enrollments: true, reviews: true, lessons: true },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  // Only owner or admin can access
  const userRole = session.user.role || ROLES.STUDENT;
  if (course.instructorId !== session.user.id && userRole !== ROLES.ADMIN) {
    throw new Error("Forbidden");
  }

  return course;
}

/**
 * Get instructor's courses
 */
export async function getInstructorCourses(status?: string) {
  const user = await requireInstructor();

  const where: Record<string, unknown> = {
    instructorId: user.id,
  };

  if (status) {
    where.status = status;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: {
        select: { enrollments: true, reviews: true, lessons: true },
      },
    },
  });

  return courses;
}

/**
 * Create a new course (Instructor/Admin only)
 */
export async function createCourse(data: CreateCourseValues) {
  return withRateLimit(
    "createCourse",
    RATE_LIMITS.CREATE_COURSE.limit,
    RATE_LIMITS.CREATE_COURSE.windowMs,
    async () => {
      const user = await requireInstructor();

      const validData = createCourseSchema.parse(data);

      // Get existing slugs to ensure uniqueness
      const existingSlugs = await prisma.course.findMany({
        select: { slug: true },
      });
      const slug = generateNumericSlug(
        validData.title,
        existingSlugs.map((c) => c.slug)
      );

      const course = await prisma.course.create({
        data: {
          title: validData.title,
          slug,
          description: validData.description,
          thumbnail: validData.thumbnail,
          price: validData.price,
          difficulty: validData.difficulty,
          categoryId: validData.categoryId,
          instructorId: user.id,
          status: "DRAFT",
        },
      });

      log.course("created", course.id, user.id, {
        title: course.title,
      });

      revalidatePath("/instructor/courses");

      return { success: true, course };
    }
  );
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, data: UpdateCourseValues) {
  return withRateLimit(
    "updateCourse",
    RATE_LIMITS.UPDATE_COURSE.limit,
    RATE_LIMITS.UPDATE_COURSE.windowMs,
    async () => {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) throw new Error("Course not found");

      const user = await requireResourceAccess(course.instructorId);

      const validData = updateCourseSchema.parse(data);

      // If title changed, regenerate slug
      let slug = course.slug;
      if (validData.title && validData.title !== course.title) {
        const existingSlugs = await prisma.course.findMany({
          where: { NOT: { id: courseId } },
          select: { slug: true },
        });
        slug = generateNumericSlug(
          validData.title,
          existingSlugs.map((c) => c.slug)
        );
      }

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...validData,
          slug,
        },
      });

      log.course("updated", courseId, user.id, validData);

      revalidatePath("/instructor/courses");
      revalidatePath(`/instructor/courses/${courseId}`);
      revalidatePath(`/courses/${course.slug}`);
      if (slug !== course.slug) {
        revalidatePath(`/courses/${slug}`);
      }

      return { success: true, course: updatedCourse };
    }
  );
}

/**
 * Publish a course
 */
export async function publishCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        where: { isPublished: true },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  const user = await requireResourceAccess(course.instructorId);

  // Validation: Must have at least one published lesson
  if (course.lessons.length === 0) {
    throw new Error("Course must have at least one published lesson before publishing");
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  log.course("published", courseId, user.id);

  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);

  return { success: true, course: updatedCourse };
}

/**
 * Archive a course
 */
export async function archiveCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  const user = await requireResourceAccess(course.instructorId);

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED" },
  });

  log.course("archived", courseId, user.id);

  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/courses");

  return { success: true, course: updatedCourse };
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  const user = await requireResourceAccess(course.instructorId);

  // Prevent deletion if course has enrollments
  if (course._count.enrollments > 0) {
    throw new Error(
      `Cannot delete course with ${course._count.enrollments} enrolled students. Archive it instead.`
    );
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  log.course("deleted", courseId, user.id, { title: course.title });

  revalidatePath("/instructor/courses");
  revalidatePath("/courses");

  return { success: true };
}

/**
 * Get course statistics for instructor
 */
export async function getCourseStats(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  await requireResourceAccess(course.instructorId);

  const [enrollmentCount, completedCount, averageProgress, reviewStats] =
    await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({
        where: { courseId, completedAt: { not: null } },
      }),
      prisma.enrollment.aggregate({
        where: { courseId },
        _avg: { progressPercent: true },
      }),
      prisma.review.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

  return {
    enrollmentCount,
    completedCount,
    completionRate:
      enrollmentCount > 0
        ? Math.round((completedCount / enrollmentCount) * 100)
        : 0,
    averageProgress: Math.round(averageProgress._avg.progressPercent || 0),
    averageRating: reviewStats._avg.rating || 0,
    reviewCount: reviewStats._count,
  };
}
