"use server";

import { prisma } from "@/lib/db";
import { toolSchema, ToolFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { ToolStatus } from "@prisma/client";

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
      orderBy: [
        { status: 'asc' }, // Pending first (if PENDING is 'PENDING' string order might not be ideal but okay)
        { createdAt: 'desc' }
      ],
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

export async function getDistinctToolCategories() {
  const categories = await prisma.tool.findMany({
    distinct: ['category'],
    select: {
      category: true,
    },
    where: {
      status: {
        not: "PENDING", // Only show non-pending tools to public
      }
    },
    orderBy: { category: "asc" },
  });
  return categories.map(c => c.category);
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

export async function updateToolStatus(id: string, status: ToolStatus) {
  await prisma.tool.update({
    where: { id },
    data: { status },
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
