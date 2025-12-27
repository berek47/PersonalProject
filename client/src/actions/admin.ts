"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

// Helper to check if user is admin
async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

// ==================== USER MANAGEMENT ====================

export async function getUsers(options?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { search, role, page = 1, limit = 20 } = options || {};
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        bannedAt: true,
        bannedReason: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            instructorCourses: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function updateUserRole(userId: string, newRole: "STUDENT" | "INSTRUCTOR" | "ADMIN") {
  const admin = await requireAdmin();

  // Prevent admin from demoting themselves
  if (userId === admin.id && newRole !== "ADMIN") {
    throw new Error("Cannot change your own admin role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function banUser(userId: string, reason: string) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    throw new Error("Cannot ban yourself");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      banned: true,
      bannedAt: new Date(),
      bannedReason: reason,
    },
  });

  // Also delete their sessions to log them out
  await prisma.session.deleteMany({
    where: { userId },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unbanUser(userId: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: {
      banned: false,
      bannedAt: null,
      bannedReason: null,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ==================== INSTRUCTOR APPLICATIONS ====================

export async function getInstructorApplications(options?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { status, page = 1, limit = 20 } = options || {};
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    prisma.instructorApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.instructorApplication.count({ where }),
  ]);

  return {
    applications,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function approveApplication(applicationId: string, notes?: string) {
  const admin = await requireAdmin();

  const application = await prisma.instructorApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Update application status and user role in a transaction
  await prisma.$transaction([
    prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        reviewNotes: notes,
      },
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: { role: "INSTRUCTOR" },
    }),
  ]);

  revalidatePath("/admin/applications");
  return { success: true };
}

export async function rejectApplication(applicationId: string, notes: string) {
  const admin = await requireAdmin();

  await prisma.instructorApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      reviewNotes: notes,
    },
  });

  revalidatePath("/admin/applications");
  return { success: true };
}

// ==================== DASHBOARD STATS ====================

export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalRevenue,
    pendingApplications,
    recentUsers,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.instructorApplication.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalRevenue: totalRevenue._sum.amount || 0,
    pendingApplications,
    recentUsers,
    recentEnrollments,
  };
}

// ==================== COURSE MANAGEMENT ====================

export async function getAdminCourses(options?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { search, status, page = 1, limit = 20 } = options || {};
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { instructor: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [coursesRaw, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        _count: {
          select: { lessons: true, enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
  ]);

  // Convert Decimal to number for serialization
  const courses = coursesRaw.map((course) => ({
    ...course,
    price: Number(course.price),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  }));

  return {
    courses,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function updateCourseStatus(courseId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  await requireAdmin();

  await prisma.course.update({
    where: { id: courseId },
    data: { status },
  });

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();

  await prisma.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/admin/courses");
  return { success: true };
}
