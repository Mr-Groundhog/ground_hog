"use server";

import { prisma } from "@/lib/db";
import { postSchema, PostFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getPosts(page = 1, pageSize = 10, query = "", categoryId?: string) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.PostWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        user: {
          select: {
            username: true,
            nickname: true,
            avatar: true, // 前台展示头像
          },
        },
        _count: {
          select: {
            comments: true,
            interactions: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createPost(data: PostFormValues, authorId: string) {
  const validated = postSchema.parse(data);

  const exist = await prisma.post.findUnique({
    where: { slug: validated.slug },
  });

  if (exist) {
    throw new Error("URL 路径已存在");
  }

  await prisma.post.create({
    data: {
      ...validated,
      userId: authorId,
    },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/graph");
  return { success: true };
}

export async function updatePost(id: string, data: PostFormValues) {
  const validated = postSchema.parse(data);

  const exist = await prisma.post.findFirst({
    where: {
      slug: validated.slug,
      NOT: { id },
    },
  });

  if (exist) {
    throw new Error("URL 路径已存在");
  }

  await prisma.post.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/graph");
  return { success: true };
}

export async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/graph");
  return { success: true };
}

export async function getPost(id: string) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      user: {
        select: {
          username: true,
          nickname: true,
          bio: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
          interactions: true,
        },
      },
    },
  });
}
