"use server";

import { requireAdmin, ROLES } from "@/lib/auth-helpers";
import { log } from "@/lib/logger";
import { createOffsetPaginatedResponse, normalizeLimit, calculateOffset } from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { updateUserRoleSchema, UpdateUserRoleValues } from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Get all users with pagination (Admin only)
 */
export async function getUsers(page: number = 1, limit: number = 10, search?: string) {
  await requireAdmin();

  const normalizedLimit = normalizeLimit(limit);
  const offset = calculateOffset(page, normalizedLimit);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: offset,
      take: normalizedLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            instructorCourses: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return createOffsetPaginatedResponse(users, page, normalizedLimit, totalCount);
}

/**
 * Get a single user by ID (Admin only)
 */
export async function getUserById(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          enrollments: true,
          instructorCourses: true,
          reviews: true,
        },
      },
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      },
      instructorCourses: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(data: UpdateUserRoleValues) {
  const admin = await requireAdmin();

  const validData = updateUserRoleSchema.parse(data);

  // Prevent admin from changing their own role
  if (admin.id === validData.userId) {
    throw new Error("You cannot change your own role");
  }

  const user = await prisma.user.findUnique({
    where: { id: validData.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const previousRole = user.role;

  const updatedUser = await prisma.user.update({
    where: { id: validData.userId },
    data: { role: validData.role },
  });

  log.admin("user_role_updated", admin.id, validData.userId, {
    previousRole,
    newRole: validData.role,
    userEmail: user.email,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${validData.userId}`);

  return { success: true, user: updatedUser };
}

/**
 * Get user statistics (Admin only)
 */
export async function getUserStats() {
  await requireAdmin();

  const [totalUsers, adminCount, instructorCount, studentCount, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: ROLES.ADMIN } }),
      prisma.user.count({ where: { role: ROLES.INSTRUCTOR } }),
      prisma.user.count({
        where: { role: ROLES.STUDENT },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

  return {
    totalUsers,
    adminCount,
    instructorCount,
    studentCount,
    recentUsers,
  };
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();

  // Prevent admin from deleting themselves
  if (admin.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deleting other admins
  if (user.role === ROLES.ADMIN) {
    throw new Error("Cannot delete admin users");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  log.admin("user_deleted", admin.id, userId, {
    userEmail: user.email,
    userRole: user.role,
  });

  revalidatePath("/admin/users");

  return { success: true };
}
