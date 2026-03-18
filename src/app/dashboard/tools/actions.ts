"use server";

import { Prisma, ToolStatus } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { toolSchema, type ToolFormValues } from "./schema";

const TOOLS_TAG = "dashboard-tools";

function buildToolWhere(search?: string): Prisma.ToolWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { name: { contains: search } },
      { description: { contains: search } },
      { category: { contains: search } },
    ],
  };
}

const getCachedTools = unstable_cache(
  async (page: number, limit: number, search?: string) => {
    const skip = (page - 1) * limit;
    const where = buildToolWhere(search);

    const [data, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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
  },
  [TOOLS_TAG],
  {
    revalidate: 60,
    tags: [TOOLS_TAG],
  }
);

const getCachedToolCategories = unstable_cache(
  async () => {
    const dbCategories = await prisma.tool.findMany({
      distinct: ["category"],
      select: {
        category: true,
      },
      where: {
        status: {
          not: "PENDING",
        },
      },
      orderBy: { category: "asc" },
    });

    const localCategories = ["Development", "Entertainment"];
    const allCategories = new Set([
      ...localCategories,
      ...dbCategories.map((item) => item.category),
    ]);

    return Array.from(allCategories).sort();
  },
  [`${TOOLS_TAG}-categories`],
  {
    revalidate: 300,
    tags: [TOOLS_TAG],
  }
);

export async function getTools({
  page = 1,
  limit = 10,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  return getCachedTools(page, limit, search);
}

export async function createTool(data: ToolFormValues) {
  const validated = toolSchema.parse(data);

  await prisma.tool.create({
    data: validated,
  });

  revalidateTag(TOOLS_TAG);
  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function getDistinctToolCategories() {
  return getCachedToolCategories();
}

export async function updateTool(id: string, data: ToolFormValues) {
  const validated = toolSchema.parse(data);

  await prisma.tool.update({
    where: { id },
    data: validated,
  });

  revalidateTag(TOOLS_TAG);
  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function updateToolStatus(id: string, status: ToolStatus) {
  await prisma.tool.update({
    where: { id },
    data: { status },
  });

  revalidateTag(TOOLS_TAG);
  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function deleteTool(id: string) {
  await prisma.tool.delete({
    where: { id },
  });

  revalidateTag(TOOLS_TAG);
  revalidatePath("/dashboard/tools");
  revalidatePath("/tools");
  return { success: true };
}
