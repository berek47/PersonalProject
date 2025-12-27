"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/get-session";
import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

/**
 * Enroll in a course
 */
export async function enrollInCourse(courseId: string) {
  return withRateLimit(
    "enroll",
    RATE_LIMITS.ENROLL.limit,
    RATE_LIMITS.ENROLL.windowMs,
    async () => {
      const user = await requireAuth();

      const course = await prisma.course.findUnique({
        where: { id: courseId, status: "PUBLISHED" },
      });

      if (!course) {
        throw new Error("Course not found or not available");
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
      });

      if (existingEnrollment) {
        throw new Error("You are already enrolled in this course");
      }

      // For free courses, enroll directly
      // For paid courses, require payment through Stripe
      const price = Number(course.price);
      if (price > 0) {
        throw new Error(
          "This is a paid course. Please use the checkout process to enroll."
        );
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId,
        },
      });

      log.enrollment("enrolled", user.id, courseId, {
        enrollmentId: enrollment.id,
        price,
      });

      revalidatePath(`/courses/${course.slug}`);
      revalidatePath("/my-courses");

      return { success: true, enrollmentId: enrollment.id };
    }
  );
}

/**
 * Get user's enrollments
 */
export async function getMyEnrollments() {
  const user = await requireAuth();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { lessons: { where: { isPublished: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments;
}

/**
 * Get user enrollments (alias for my-courses page)
 */
export async function getUserEnrollments() {
  const user = await requireAuth();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { lessons: { where: { isPublished: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // Get completed lessons count for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId: user.id,
          isCompleted: true,
          lesson: {
            courseId: enrollment.courseId,
            isPublished: true,
          },
        },
      });

      return {
        ...enrollment,
        _count: {
          lessonProgress: completedCount,
        },
      };
    })
  );

  return enrollmentsWithProgress;
}

/**
 * Get enrollment with progress details
 */
export async function getEnrollmentWithProgress(courseId: string) {
  const user = await requireAuth();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("Not enrolled in this course");
  }

  // Get completed lessons
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      isCompleted: true,
      lesson: { courseId },
    },
    select: { lessonId: true },
  });

  return {
    ...enrollment,
    lessonProgress,
  };
}

/**
 * Get enrollment by ID (for certificates)
 */
export async function getEnrollmentById(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      course: {
        include: {
          instructor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  return enrollment;
}

/**
 * Get enrollment for a specific course
 */
export async function getEnrollment(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  return enrollment;
}

/**
 * Check if user is enrolled in a course
 */
export async function isEnrolled(courseId: string): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  return !!enrollment;
}

/**
 * Mark a lesson as complete
 */
export async function markLessonComplete(lessonId: string, _courseId?: string) {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course");
  }

  // Update or create lesson progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    create: {
      userId: user.id,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Calculate new progress percentage
  const totalLessons = lesson.course.lessons.length;
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: user.id,
      isCompleted: true,
      lesson: { courseId: lesson.courseId, isPublished: true },
    },
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  const courseCompleted = progressPercent === 100;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent,
      ...(courseCompleted && !enrollment.completedAt && { completedAt: new Date() }),
    },
  });

  log.lesson("completed", lessonId, user.id, {
    courseId: lesson.courseId,
    progress: progressPercent,
  });

  if (courseCompleted && !enrollment.completedAt) {
    log.enrollment("completed", user.id, lesson.courseId, {
      enrollmentId: enrollment.id,
    });
  }

  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/my-courses");

  return {
    success: true,
    progress: progressPercent,
    courseCompleted,
    enrollmentId: enrollment.id,
  };
}

/**
 * Mark a lesson as incomplete
 */
export async function markLessonIncomplete(lessonId: string) {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: {
            where: { isPublished: true },
          },
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course");
  }

  // Update lesson progress
  await prisma.lessonProgress.update({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    data: {
      isCompleted: false,
      completedAt: null,
    },
  });

  // Recalculate progress
  const totalLessons = lesson.course.lessons.length;
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: user.id,
      isCompleted: true,
      lesson: { courseId: lesson.courseId, isPublished: true },
    },
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent,
      completedAt: null, // Reset completion if it was set
    },
  });

  revalidatePath(`/learn/${lesson.course.slug}`);
  revalidatePath("/my-courses");

  return {
    success: true,
    progress: progressPercent,
  };
}

/**
 * Get course progress for a user
 */
export async function getCourseProgress(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  if (!enrollment) return null;

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: { courseId },
    },
    select: {
      lessonId: true,
      isCompleted: true,
    },
  });

  return {
    progressPercent: enrollment.progressPercent,
    completedAt: enrollment.completedAt,
    lessonProgress: lessonProgress.reduce(
      (acc, p) => {
        acc[p.lessonId] = p.isCompleted;
        return acc;
      },
      {} as Record<string, boolean>
    ),
  };
}

/**
 * Get next lesson to continue
 */
export async function getNextLesson(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) return null;

  // Get all published lessons ordered
  const lessons = await prisma.lesson.findMany({
    where: { courseId, isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true },
  });

  // Get completed lessons
  const completedLessonIds = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      isCompleted: true,
      lesson: { courseId },
    },
    select: { lessonId: true },
  });

  const completedSet = new Set(completedLessonIds.map((l) => l.lessonId));

  // Find first incomplete lesson
  const nextLesson = lessons.find((l) => !completedSet.has(l.id));

  return nextLesson || lessons[0] || null;
}
