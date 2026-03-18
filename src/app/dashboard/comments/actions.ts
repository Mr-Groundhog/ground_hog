"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const COMMENTS_TAG = "dashboard-comments";

const getCachedComments = unstable_cache(
  async (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            select: { title: true, slug: true },
          },
          user: {
            select: { username: true, nickname: true, avatar: true },
          },
        },
      }),
      prisma.comment.count(),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
  [COMMENTS_TAG],
  {
    revalidate: 30,
    tags: [COMMENTS_TAG],
  }
);

export async function getComments(page = 1, pageSize = 20) {
  return getCachedComments(page, pageSize);
}

export async function deleteComment(id: string) {
  await prisma.comment.delete({
    where: { id },
  });

  revalidateTag(COMMENTS_TAG);
  revalidatePath("/dashboard/comments");
  return { success: true };
}
