"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { postSchema, type PostFormValues } from "./schema";

const POSTS_TAG = "dashboard-posts";

function buildPostsWhere(query: string, categoryId?: string): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};

  if (query) {
    where.OR = [{ title: { contains: query } }, { excerpt: { contains: query } }];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  return where;
}

const getCachedPosts = unstable_cache(
  async (page: number, pageSize: number, query: string, categoryId?: string) => {
    const skip = (page - 1) * pageSize;
    const where = buildPostsWhere(query, categoryId);

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
  },
  [POSTS_TAG],
  {
    revalidate: 300,
    tags: [POSTS_TAG],
  }
);

export async function getPosts(page = 1, pageSize = 10, query = "", categoryId?: string) {
  return getCachedPosts(page, pageSize, query, categoryId);
}

export async function createPost(data: PostFormValues, authorId: string) {
  const validated = postSchema.parse(data);

  const exist = await prisma.post.findUnique({
    where: { slug: validated.slug },
  });

  if (exist) {
    throw new Error("Slug already exists");
  }

  await prisma.post.create({
    data: {
      ...validated,
      userId: authorId,
    },
  });

  revalidateTag(POSTS_TAG);
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
    throw new Error("Slug already exists");
  }

  await prisma.post.update({
    where: { id },
    data: validated,
  });

  revalidateTag(POSTS_TAG);
  revalidatePath("/dashboard/posts");
  revalidatePath("/graph");
  return { success: true };
}

export async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id },
  });

  revalidateTag(POSTS_TAG);
  revalidatePath("/dashboard/posts");
  revalidatePath("/graph");
  return { success: true };
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
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
