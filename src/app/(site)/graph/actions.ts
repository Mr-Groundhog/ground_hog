"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function getCommentsByPostId(postId: string) {
  return await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      user: {
        select: {
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              username: true,
              nickname: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createComment(postId: string, content: string, parentId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.create({
    data: {
      content,
      postId,
      userId: user.id,
      parentId,
    },
  });

  revalidatePath(`/graph`);
  // 这里很难 revalidate 具体 slug，除非传入 slug
  return { success: true };
}

export async function toggleInteraction(postId: string, type: "LIKE" | "FAVORITE") {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.interaction.findUnique({
    where: {
      userId_postId_type: {
        userId: user.id,
        postId,
        type,
      },
    },
  });

  if (existing) {
    await prisma.interaction.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.interaction.create({
      data: {
        userId: user.id,
        postId,
        type,
      },
    });
  }

  revalidatePath(`/graph`);
  return { success: true, added: !existing };
}

export async function getInteractionStatus(postId: string) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Ignore error, treat as not logged in
  }
  
  if (!user) {
    return { liked: false, favorited: false };
  }

  const [like, favorite] = await Promise.all([
    prisma.interaction.findUnique({
      where: {
        userId_postId_type: {
          userId: user.id,
          postId,
          type: "LIKE",
        },
      },
    }),
    prisma.interaction.findUnique({
      where: {
        userId_postId_type: {
          userId: user.id,
          postId,
          type: "FAVORITE",
        },
      },
    }),
  ]);

  return { liked: !!like, favorited: !!favorite };
}
