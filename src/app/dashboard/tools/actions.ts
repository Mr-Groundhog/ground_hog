"use server";

import { prisma } from "@/lib/db";
import { toolSchema, ToolFormValues } from "./schema";
import { revalidatePath } from "next/cache";

export async function getTools({
  page = 1,
  limit = 10,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { category: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tool.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createTool(data: ToolFormValues) {
  const validated = toolSchema.parse(data);
  
  await prisma.tool.create({
    data: validated,
  });

  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function updateTool(id: string, data: ToolFormValues) {
  const validated = toolSchema.parse(data);

  await prisma.tool.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function deleteTool(id: string) {
  await prisma.tool.delete({
    where: { id },
  });

  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}
