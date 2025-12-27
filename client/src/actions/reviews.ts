"use server";

import { requireAuth, requireResourceAccess } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/get-session";
import { log } from "@/lib/logger";
import { createPaginatedResponse, normalizeLimit } from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  createReviewSchema,
  CreateReviewValues,
  updateReviewSchema,
  UpdateReviewValues,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Get reviews for a course
 */
export async function getCourseReviews(
  courseId: string,
  cursor?: string,
  limit: number = 10
) {
  const normalizedLimit = normalizeLimit(limit);

  const reviews = await prisma.review.findMany({
    where: { courseId },
    take: normalizedLimit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return createPaginatedResponse(reviews, normalizedLimit);
}

/**
 * Get average rating for a course
 */
export async function getCourseRating(courseId: string) {
  const stats = await prisma.review.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: true,
  });

  return {
    averageRating: stats._avg.rating || 0,
    reviewCount: stats._count,
  };
}

/**
 * Get user's review for a course
 */
export async function getUserReview(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) return null;

  const review = await prisma.review.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  return review;
}

/**
 * Create a review
 */
export async function createReview(courseId: string, data: CreateReviewValues) {
  return withRateLimit(
    "createReview",
    RATE_LIMITS.CREATE_REVIEW.limit,
    RATE_LIMITS.CREATE_REVIEW.windowMs,
    async () => {
      const user = await requireAuth();

      const validData = createReviewSchema.parse(data);

      // Check if course exists and is published
      const course = await prisma.course.findUnique({
        where: { id: courseId, status: "PUBLISHED" },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      // Check if user is enrolled
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new Error("You must be enrolled in this course to leave a review");
      }

      // Check if user already reviewed
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this course");
      }

      const review = await prisma.review.create({
        data: {
          rating: validData.rating,
          comment: validData.comment || "",
          userId: user.id,
          courseId,
        },
      });

      log.review("created", review.id, user.id, courseId, {
        rating: validData.rating,
      });

      revalidatePath(`/courses/${course.slug}`);

      return { success: true, review };
    }
  );
}

/**
 * Update a review
 */
export async function updateReview(reviewId: string, data: UpdateReviewValues) {
  const user = await requireAuth();

  const validData = updateReviewSchema.parse(data);

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      course: {
        select: { slug: true },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== user.id) {
    throw new Error("You can only edit your own reviews");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: validData,
  });

  log.review("updated", reviewId, user.id, review.courseId, validData);

  revalidatePath(`/courses/${review.course.slug}`);

  return { success: true, review: updatedReview };
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      course: {
        select: { slug: true, instructorId: true },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // User can delete their own review, or admin/instructor can delete
  const isOwner = review.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isInstructor = review.course.instructorId === session.user.id;

  if (!isOwner && !isAdmin && !isInstructor) {
    throw new Error("You cannot delete this review");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  log.review("deleted", reviewId, session.user.id, review.courseId);

  revalidatePath(`/courses/${review.course.slug}`);

  return { success: true };
}

/**
 * Get review statistics for instructor dashboard
 */
export async function getInstructorReviewStats() {
  const user = await requireAuth();

  // Get all reviews for instructor's courses
  const reviews = await prisma.review.findMany({
    where: {
      course: {
        instructorId: user.id,
      },
    },
    include: {
      course: {
        select: { id: true, title: true },
      },
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = await prisma.review.aggregate({
    where: {
      course: {
        instructorId: user.id,
      },
    },
    _avg: { rating: true },
    _count: true,
  });

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: {
      course: {
        instructorId: user.id,
      },
    },
    _count: true,
  });

  return {
    recentReviews: reviews,
    averageRating: stats._avg.rating || 0,
    totalReviews: stats._count,
    distribution: distribution.reduce(
      (acc, d) => {
        acc[d.rating] = d._count;
        return acc;
      },
      {} as Record<number, number>
    ),
  };
}
