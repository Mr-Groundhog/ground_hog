"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { aiToolSchema, type AiToolFormValues } from "./schema";

const AI_TOOLS_TAG = "dashboard-ai-tools";

function buildAiToolWhere(
  status?: "PENDING" | "APPROVED" | "REJECTED",
  search?: string
): Prisma.AiToolWhereInput {
  const where: Prisma.AiToolWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  return where;
}

const getCachedAiTools = unstable_cache(
  async (
    page: number,
    limit: number,
    status?: "PENDING" | "APPROVED" | "REJECTED",
    search?: string
  ) => {
    const skip = (page - 1) * limit;
    const where = buildAiToolWhere(status, search);

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
  },
  [AI_TOOLS_TAG],
  {
    revalidate: 60,
    tags: [AI_TOOLS_TAG],
  }
);

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
  return getCachedAiTools(page, limit, status, search);
}

export async function createAiTool(data: AiToolFormValues) {
  const validated = aiToolSchema.parse(data);

  await prisma.aiTool.create({
    data: {
      ...validated,
      status: "APPROVED",
    },
  });

  revalidateTag(AI_TOOLS_TAG);
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

  revalidateTag(AI_TOOLS_TAG);
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function deleteAiTool(id: string) {
  await prisma.aiTool.delete({
    where: { id },
  });

  revalidateTag(AI_TOOLS_TAG);
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function approveAiTool(id: string) {
  await prisma.aiTool.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidateTag(AI_TOOLS_TAG);
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}

export async function rejectAiTool(id: string) {
  await prisma.aiTool.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidateTag(AI_TOOLS_TAG);
  revalidatePath("/dashboard/ai-tools");
  revalidatePath("/ai-platform");
  return { success: true };
}
