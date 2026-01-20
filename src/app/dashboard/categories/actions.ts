"use server";

import { prisma } from "@/lib/db";
import { categorySchema, CategoryFormValues } from "./schema";
import { revalidatePath } from "next/cache";

export async function getCategories(query = "") {
  const categories = await prisma.category.findMany({
    where: {
      name: { contains: query },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
  return categories;
}

export async function createCategory(data: CategoryFormValues) {
  const validated = categorySchema.parse(data);

  const exist = await prisma.category.findFirst({
    where: {
      OR: [{ name: validated.name }, { slug: validated.slug }],
    },
  });

  if (exist) {
    throw new Error("分类名称或路径已存在");
  }

  await prisma.category.create({
    data: validated,
  });

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
    throw new Error("分类名称或路径已存在");
  }

  await prisma.category.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  // 检查是否有文章关联
  const count = await prisma.post.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    throw new Error("该分类下还有文章，无法删除");
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}
