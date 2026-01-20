"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getComments(page = 1, pageSize = 20) {
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
}

export async function deleteComment(id: string) {
  await prisma.comment.delete({
    where: { id },
  });

  revalidatePath("/dashboard/comments");
  // 详情页也需要刷新，这里暂时不指定具体 slug，可能需要全局 revalidate 或者客户端更新
  return { success: true };
}
