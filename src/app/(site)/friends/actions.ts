"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const applySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().optional(),
  logo: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  coverImage: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  email: z.string().email("请输入有效的邮箱").optional().or(z.literal("")),
});

export async function applyFriendLink(data: z.infer<typeof applySchema>) {
  const validated = applySchema.parse(data);
  
  await prisma.friendLink.create({
    data: {
      ...validated,
      status: "PENDING",
    },
  });
  
  return { success: true };
}

export async function getPublicFriendLinks() {
  return await prisma.friendLink.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}
