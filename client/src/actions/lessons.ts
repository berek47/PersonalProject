"use server";

import { requireResourceAccess } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/get-session";
import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { slugify, generateNumericSlug } from "@/lib/slugify";
import {
  createLessonSchema,
  CreateLessonValues,
  updateLessonSchema,
  UpdateLessonValues,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Get all lessons for a course (for instructor management)
 */
export async function getCourseLessons(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  await requireResourceAccess(course.instructorId);

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  return lessons;
}

/**
 * Get a single lesson by ID (for editing)
 */
export async function getLessonById(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          instructorId: true,
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  await requireResourceAccess(lesson.course.instructorId);

  return lesson;
}

/**
 * Get lesson by slug (for student viewing)
 */
export async function getLessonBySlug(slug: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { slug },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          instructorId: true,
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  return lesson;
}

/**
 * Get lesson for viewing (students)
 */
export async function getLessonForViewer(courseSlug: string, lessonSlug: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      course: { slug: courseSlug },
      isPublished: true,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          instructorId: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              duration: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  // Check if user is enrolled or is the instructor
  const isInstructor = lesson.course.instructorId === session.user.id;

  if (!isInstructor) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.course.id,
        },
      },
    });

    if (!enrollment) {
      throw new Error("You must be enrolled in this course to view lessons");
    }
  }

  // Get user's progress for this lesson
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  return {
    ...lesson,
    isCompleted: progress?.isCompleted || false,
  };
}

/**
 * Create a new lesson
 */
export async function createLesson(courseId: string, data: CreateLessonValues) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  const user = await requireResourceAccess(course.instructorId);

  const validData = createLessonSchema.parse(data);

  // Get existing slugs for this course
  const existingLessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { slug: true, order: true },
  });

  const slug = generateNumericSlug(
    validData.title,
    existingLessons.map((l) => l.slug)
  );

  // Check if order is already taken
  const orderExists = existingLessons.some((l) => l.order === validData.order);
  if (orderExists) {
    throw new Error(`A lesson with order ${validData.order} already exists`);
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: validData.title,
      slug,
      content: validData.content,
      videoUrl: validData.videoUrl || null,
      duration: validData.duration,
      order: validData.order,
      courseId,
    },
  });

  log.lesson("created", lesson.id, user.id, {
    courseId,
    title: lesson.title,
  });

  revalidatePath(`/instructor/courses/${courseId}/lessons`);

  return { success: true, lesson };
}

/**
 * Update a lesson
 */
export async function updateLesson(lessonId: string, data: UpdateLessonValues) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, instructorId: true, slug: true },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  const user = await requireResourceAccess(lesson.course.instructorId);

  const validData = updateLessonSchema.parse(data);

  // If title changed, regenerate slug
  let slug = lesson.slug;
  if (validData.title && validData.title !== lesson.title) {
    const existingLessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId, NOT: { id: lessonId } },
      select: { slug: true },
    });
    slug = generateNumericSlug(
      validData.title,
      existingLessons.map((l) => l.slug)
    );
  }

  // Check if order is already taken
  if (validData.order && validData.order !== lesson.order) {
    const orderExists = await prisma.lesson.findFirst({
      where: {
        courseId: lesson.courseId,
        order: validData.order,
        NOT: { id: lessonId },
      },
    });
    if (orderExists) {
      throw new Error(`A lesson with order ${validData.order} already exists`);
    }
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...validData,
      slug,
      videoUrl: validData.videoUrl || null,
    },
  });

  log.lesson("updated", lessonId, user.id, validData);

  revalidatePath(`/instructor/courses/${lesson.course.id}/lessons`);
  revalidatePath(`/instructor/courses/${lesson.course.id}/lessons/${lessonId}`);
  revalidatePath(`/learn/${lesson.course.slug}/${lesson.slug}`);

  return { success: true, lesson: updatedLesson };
}

/**
 * Publish a lesson
 */
export async function publishLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, instructorId: true, slug: true },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  const user = await requireResourceAccess(lesson.course.instructorId);

  const updatedLesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { isPublished: true },
  });

  log.lesson("published", lessonId, user.id);

  revalidatePath(`/instructor/courses/${lesson.course.id}/lessons`);
  revalidatePath(`/courses/${lesson.course.slug}`);

  return { success: true, lesson: updatedLesson };
}

/**
 * Unpublish a lesson
 */
export async function unpublishLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, instructorId: true, slug: true },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  const user = await requireResourceAccess(lesson.course.instructorId);

  const updatedLesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { isPublished: false },
  });

  log.lesson("updated", lessonId, user.id, { isPublished: false });

  revalidatePath(`/instructor/courses/${lesson.course.id}/lessons`);
  revalidatePath(`/courses/${lesson.course.slug}`);

  return { success: true, lesson: updatedLesson };
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, instructorId: true, slug: true },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found");

  const user = await requireResourceAccess(lesson.course.instructorId);

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  log.lesson("deleted", lessonId, user.id, { title: lesson.title });

  revalidatePath(`/instructor/courses/${lesson.course.id}/lessons`);
  revalidatePath(`/courses/${lesson.course.slug}`);

  return { success: true };
}

/**
 * Reorder lessons
 */
export async function reorderLessons(
  courseId: string,
  lessonOrders: { id: string; order: number }[]
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  await requireResourceAccess(course.instructorId);

  // Update all lessons in a transaction
  await prisma.$transaction(
    lessonOrders.map(({ id, order }) =>
      prisma.lesson.update({
        where: { id },
        data: { order },
      })
    )
  );

  revalidatePath(`/instructor/courses/${courseId}/lessons`);
  revalidatePath(`/courses/${course.slug}`);

  return { success: true };
}

/**
 * Get next lesson order number
 */
export async function getNextLessonOrder(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  await requireResourceAccess(course.instructorId);

  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return (lastLesson?.order || 0) + 1;
}
