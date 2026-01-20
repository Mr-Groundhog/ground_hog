"use server";

import { prisma } from "@/lib/db";
import { friendLinkSchema, FriendLinkFormValues } from "./schema";
import { revalidatePath } from "next/cache";

export async function getFriendLinks({
  page = 1,
  limit = 5,
  status,
}: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
} = {}) {
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
}

export async function createFriendLink(data: FriendLinkFormValues) {
  const validated = friendLinkSchema.parse(data);
  
  await prisma.friendLink.create({
    data: {
      ...validated,
      status: "APPROVED", // Admin create is approved by default
    },
  });

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

  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function deleteFriendLink(id: string) {
  await prisma.friendLink.delete({
    where: { id },
  });

  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function approveFriendLink(id: string) {
  await prisma.friendLink.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}

export async function rejectFriendLink(id: string) {
  await prisma.friendLink.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/dashboard/friend-links");
  revalidatePath("/friends");
  return { success: true };
}
