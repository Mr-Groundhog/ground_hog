"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { categorySchema, type CategoryFormValues } from "./schema";

const CATEGORIES_TAG = "dashboard-categories";

const getCachedCategories = unstable_cache(
  async (query: string) =>
    prisma.category.findMany({
      where: {
        name: { contains: query },
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
  [CATEGORIES_TAG],
  {
    revalidate: 300,
    tags: [CATEGORIES_TAG],
  }
);

export async function getCategories(query = "") {
  return getCachedCategories(query);
}

export async function createCategory(data: CategoryFormValues) {
  const validated = categorySchema.parse(data);

  const exist = await prisma.category.findFirst({
    where: {
      OR: [{ name: validated.name }, { slug: validated.slug }],
    },
  });

  if (exist) {
    throw new Error("Category name or slug already exists");
  }

  await prisma.category.create({
    data: validated,
  });

  revalidateTag(CATEGORIES_TAG);
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  const validated = categorySchema.parse(data);

  const exist = await prisma.category.findFirst({
    where: {
      OR: [{ name: validated.name }, { slug: validated.slug }],
      NOT: { id },
    },
  });

  if (exist) {
    throw new Error("Category name or slug already exists");
  }

  await prisma.category.update({
    where: { id },
    data: validated,
  });

  revalidateTag(CATEGORIES_TAG);
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const count = await prisma.post.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    throw new Error("Category still has posts");
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidateTag(CATEGORIES_TAG);
  revalidatePath("/dashboard/categories");
  return { success: true };
}
