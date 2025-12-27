"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/slugify";
import { categorySchema, CategoryValues } from "@/lib/validation";
import { revalidatePath } from "next/cache";

/**
 * Get all categories
 */
export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return categories;
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return category;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return category;
}

/**
 * Create a new category (Admin only)
 */
export async function createCategory(data: CategoryValues) {
  return withRateLimit("createCategory", 10, 60000, async () => {
    const admin = await requireAdmin();

    const validData = categorySchema.parse(data);
    const slug = slugify(validData.name);

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("A category with this name already exists");
    }

    const category = await prisma.category.create({
      data: {
        name: validData.name,
        slug,
        description: validData.description,
      },
    });

    log.admin("category_created", admin.id, category.id, {
      name: category.name,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/courses");

    return { success: true, category };
  });
}

/**
 * Update a category (Admin only)
 */
export async function updateCategory(id: string, data: CategoryValues) {
  const admin = await requireAdmin();

  const validData = categorySchema.parse(data);

  // Check if the category exists
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  // If name changed, generate new slug and check for conflicts
  let slug = existing.slug;
  if (validData.name !== existing.name) {
    slug = slugify(validData.name);
    const slugExists = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugExists) {
      throw new Error("A category with this name already exists");
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: validData.name,
      slug,
      description: validData.description,
    },
  });

  log.admin("category_updated", admin.id, category.id, {
    name: category.name,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/courses");

  return { success: true, category };
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategory(id: string) {
  const admin = await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category._count.courses > 0) {
    throw new Error(
      `Cannot delete category with ${category._count.courses} courses. Please reassign courses first.`
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  log.admin("category_deleted", admin.id, id, {
    name: category.name,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/courses");

  return { success: true };
}
