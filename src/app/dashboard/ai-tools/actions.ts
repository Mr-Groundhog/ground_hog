"use server";

import { prisma } from "@/lib/db";
import { aiToolSchema, AiToolFormValues } from "./schema";
import { revalidatePath } from "next/cache";

export async function getAiTools({
  page = 1,
  limit = 10,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
} = {}) {
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.aiTool.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiTool.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createAiTool(data: AiToolFormValues) {
  const validated = aiToolSchema.parse(data);
  
  await prisma.aiTool.create({
    data: {
      ...validated,
      status: "APPROVED", // Admin create is approved by default
    },
  });

  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function updateAiTool(id: string, data: AiToolFormValues) {
  const validated = aiToolSchema.parse(data);

  await prisma.aiTool.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function deleteAiTool(id: string) {
  await prisma.aiTool.delete({
    where: { id },
  });

  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function approveAiTool(id: string) {
  await prisma.aiTool.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function rejectAiTool(id: string) {
  await prisma.aiTool.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}
