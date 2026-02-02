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

  // 如果有邮箱且请求对象存在，则发送邮件
  if (friendLink.email && request) {
    try {
      // 获取客户端IP
      let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
      if (!ip) {
        ip = "127.0.0.1";
      }
      if (ip && ip.includes(",")) {
        ip = ip.split(",")[0].trim();
      }

      const { sendFriendApproveEmail } = await import("@/lib/email-service");
      await sendFriendApproveEmail(friendLink.email, friendLink.name, ip);
    } catch (error) {
      console.error("发送邮件失败:", error);
      // 邮件发送失败不阻止审核通过操作
    }
  }

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
