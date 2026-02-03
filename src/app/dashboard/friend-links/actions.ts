"use server";

import { prisma } from "@/lib/db";
import { friendLinkSchema, FriendLinkFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { sendFriendApproveEmail } from "@/lib/email-service";
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

export async function approveFriendLink(id: string, request?: Request) {
  const friendLink = await prisma.friendLink.findUnique({
    where: { id },
  });

  if (!friendLink) {
    throw new Error("友链不存在");
  }

  // 更新友链状态
  await prisma.friendLink.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  // 注意：邮件发送现在通过API路由处理，以确保正确获取IP地址
  // 如果是通过API路由调用（如前端管理界面），邮件会在那里处理
  // 这里只更新状态，不处理邮件发送逻辑

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
