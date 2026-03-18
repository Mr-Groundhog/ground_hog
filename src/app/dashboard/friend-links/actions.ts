"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { friendLinkSchema, type FriendLinkFormValues } from "./schema";

const FRIEND_LINKS_TAG = "dashboard-friend-links";

const getCachedFriendLinks = unstable_cache(
  async (
    page: number,
    limit: number,
    status?: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      prisma.friendLink.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.friendLink.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  [FRIEND_LINKS_TAG],
  {
    revalidate: 60,
    tags: [FRIEND_LINKS_TAG],
  }
);

export async function getFriendLinks({
  page = 1,
  limit = 5,
  status,
}: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
} = {}) {
  return getCachedFriendLinks(page, limit, status);
}

export async function createFriendLink(data: FriendLinkFormValues) {
  const validated = friendLinkSchema.parse(data);

  await prisma.friendLink.create({
    data: {
      ...validated,
      status: "APPROVED",
    },
  });

  revalidateTag(FRIEND_LINKS_TAG);
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function updateFriendLink(id: string, data: FriendLinkFormValues) {
  const validated = friendLinkSchema.parse(data);

  await prisma.friendLink.update({
    where: { id },
    data: validated,
  });

  revalidateTag(FRIEND_LINKS_TAG);
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function deleteFriendLink(id: string) {
  await prisma.friendLink.delete({
    where: { id },
  });

  revalidateTag(FRIEND_LINKS_TAG);
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function approveFriendLink(id: string) {
  const friendLink = await prisma.friendLink.findUnique({
    where: { id },
  });

  if (!friendLink) {
    throw new Error("Friend link not found");
  }

  await prisma.friendLink.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidateTag(FRIEND_LINKS_TAG);
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function rejectFriendLink(id: string) {
  await prisma.friendLink.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidateTag(FRIEND_LINKS_TAG);
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}
