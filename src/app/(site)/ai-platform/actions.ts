"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const applySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().min(1, "描述不能为空"),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.string().optional(),
});

export async function applyAiTool(data: z.infer<typeof applySchema>) {
  const validated = applySchema.parse(data);
  
  await prisma.aiTool.create({
    data: {
      ...validated,
      status: "PENDING",
    },
  });
  
  return { success: true };
}

export async function getPublicAiTools(params?: {
  search?: string;
  category?: string;
  tag?: string;
}) {
  const where: any = { status: "APPROVED" };
  
  if (params?.category && params.category !== "全部") {
    where.category = params.category;
  }
  
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { description: { contains: params.search } },
      { tags: { contains: params.search } },
    ];
  }

  // Tag filtering needs to check if tag is in the comma separated string
  if (params?.tag) {
     where.tags = { contains: params.tag };
  }

  return await prisma.aiTool.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}
