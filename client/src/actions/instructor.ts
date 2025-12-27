"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

// ==================== INSTRUCTOR APPLICATION ====================

export async function submitInstructorApplication(data: {
  expertise: string;
  experience: string;
  bio: string;
  courseTopic: string;
  sampleVideo?: string;
  linkedin?: string;
  website?: string;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("You must be logged in to apply");
  }

  // Check if user already has an application
  const existingApplication = await prisma.instructorApplication.findUnique({
    where: { userId: session.user.id },
  });

  if (existingApplication) {
    if (existingApplication.status === "PENDING") {
      throw new Error("You already have a pending application");
    }
    if (existingApplication.status === "APPROVED") {
      throw new Error("Your application was already approved");
    }
    // If rejected, allow reapplication by updating
    await prisma.instructorApplication.update({
      where: { id: existingApplication.id },
      data: {
        ...data,
        status: "PENDING",
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
      },
    });
    revalidatePath("/become-instructor");
    return { success: true, reapplied: true };
  }

  // Check if user is already an instructor
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role === "INSTRUCTOR" || user?.role === "ADMIN") {
    throw new Error("You are already an instructor or admin");
  }

  // Create new application
  await prisma.instructorApplication.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  revalidatePath("/become-instructor");
  return { success: true };
}

export async function getMyApplication() {
  const session = await getServerSession();
  if (!session?.user) {
    return null;
  }

  const application = await prisma.instructorApplication.findUnique({
    where: { userId: session.user.id },
  });

  return application;
}

// ==================== INSTRUCTOR COURSES ====================

export async function getInstructorCourses() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
    throw new Error("You must be an instructor to view courses");
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      category: { select: { name: true } },
      _count: {
        select: { lessons: true, enrollments: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return courses;
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description: string;
  price: number;
  difficulty: string;
  categoryId?: string;
  thumbnail?: string;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
    throw new Error("You must be an instructor to create courses");
  }

  // Check if slug is unique
  const existingCourse = await prisma.course.findUnique({
    where: { slug: data.slug },
  });

  if (existingCourse) {
    throw new Error("A course with this slug already exists");
  }

  const course = await prisma.course.create({
    data: {
      ...data,
      instructorId: session.user.id,
    },
  });

  revalidatePath("/instructor/courses");
  return course;
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    price?: number;
    difficulty?: string;
    categoryId?: string;
    thumbnail?: string;
    status?: string;
  }
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to edit this course");
  }

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== course.slug) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: data.slug },
    });
    if (existingCourse) {
      throw new Error("A course with this slug already exists");
    }
  }

  await prisma.course.update({
    where: { id: courseId },
    data,
  });

  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to delete this course");
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/instructor/courses");
  return { success: true };
}

// ==================== LESSON MANAGEMENT ====================

export async function getCourseWithLessons(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      category: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to view this course");
  }

  return course;
}

export async function createLesson(
  courseId: string,
  data: {
    title: string;
    slug: string;
    content: string;
    videoUrl?: string;
    duration?: number;
  }
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to add lessons to this course");
  }

  // Get next order number
  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const lesson = await prisma.lesson.create({
    data: {
      ...data,
      courseId,
      order: (lastLesson?.order || 0) + 1,
    },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  return lesson;
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    videoUrl?: string;
    duration?: number;
    isPublished?: boolean;
    order?: number;
  }
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (lesson.course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to edit this lesson");
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data,
  });

  revalidatePath(`/instructor/courses/${lesson.courseId}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (lesson.course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to delete this lesson");
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath(`/instructor/courses/${lesson.courseId}`);
  return { success: true };
}

export async function reorderLessons(courseId: string, lessonIds: string[]) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (course.instructorId !== session.user.id && user?.role !== "ADMIN") {
    throw new Error("You don't have permission to reorder lessons");
  }

  // Update order for each lesson
  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { order: index + 1 },
      })
    )
  );

  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

// ==================== INSTRUCTOR STATS ====================

export async function getInstructorStats() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
    throw new Error("You must be an instructor");
  }

  const [
    totalCourses,
    publishedCourses,
    totalStudents,
    totalRevenue,
    averageRating,
    recentEnrollments,
  ] = await Promise.all([
    prisma.course.count({ where: { instructorId: session.user.id } }),
    prisma.course.count({ where: { instructorId: session.user.id, status: "PUBLISHED" } }),
    prisma.enrollment.count({
      where: { course: { instructorId: session.user.id } },
    }),
    prisma.payment.aggregate({
      where: {
        course: { instructorId: session.user.id },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    prisma.review.aggregate({
      where: { course: { instructorId: session.user.id } },
      _avg: { rating: true },
    }),
    prisma.enrollment.findMany({
      where: { course: { instructorId: session.user.id } },
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return {
    totalCourses,
    publishedCourses,
    totalStudents,
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    averageRating: averageRating._avg.rating || 0,
    recentEnrollments,
  };
}
