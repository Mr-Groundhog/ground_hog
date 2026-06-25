"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { promptTemplateSchema, type PromptTemplateFormValues } from "./schema";

const PROMPT_TEMPLATES_TAG = "dashboard-prompt-templates";

/** 去除 HTML 标签，防止 XSS 注入 */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function buildPromptWhere(
  status?: "PENDING" | "APPROVED" | "REJECTED",
  search?: string,
  category?: string
): Prisma.PromptTemplateWhereInput {
  const where: Prisma.PromptTemplateWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { content: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  return where;
}

const getCachedPromptTemplates = unstable_cache(
  async (
    page: number,
    limit: number,
    status?: "PENDING" | "APPROVED" | "REJECTED",
    search?: string,
    category?: string
  ) => {
    const skip = (page - 1) * limit;
    const where = buildPromptWhere(status, search, category);

    const [data, total] = await Promise.all([
      prisma.promptTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.promptTemplate.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  [PROMPT_TEMPLATES_TAG],
  {
    revalidate: 300,
    tags: [PROMPT_TEMPLATES_TAG],
  }
);

export async function getPromptTemplates({
  page = 1,
  limit = 10,
  status,
  search,
  category,
}: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
  category?: string;
} = {}) {
  return getCachedPromptTemplates(page, limit, status, search, category);
}

export async function createPromptTemplate(data: PromptTemplateFormValues) {
  const validated = promptTemplateSchema.parse(data);

  // XSS 防护：去除所有 HTML 标签
  const sanitized = {
    ...validated,
    title: stripHtml(validated.title),
    description: stripHtml(validated.description),
    content: stripHtml(validated.content),
    tags: validated.tags ? stripHtml(validated.tags) : undefined,
  };

  await prisma.promptTemplate.create({
    data: {
      ...sanitized,
      status: "APPROVED",
    },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

export async function updatePromptTemplate(id: string, data: PromptTemplateFormValues) {
  const validated = promptTemplateSchema.parse(data);

  // XSS 防护：去除所有 HTML 标签
  const sanitized = {
    ...validated,
    title: stripHtml(validated.title),
    description: stripHtml(validated.description),
    content: stripHtml(validated.content),
    tags: validated.tags ? stripHtml(validated.tags) : undefined,
  };

  await prisma.promptTemplate.update({
    where: { id },
    data: sanitized,
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

export async function deletePromptTemplate(id: string) {
  await prisma.promptTemplate.delete({
    where: { id },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

export async function approvePromptTemplate(id: string) {
  await prisma.promptTemplate.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

export async function rejectPromptTemplate(id: string) {
  await prisma.promptTemplate.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

// 统计各状态数量
export async function getPromptTemplateStats() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.promptTemplate.count(),
    prisma.promptTemplate.count({ where: { status: "PENDING" } }),
    prisma.promptTemplate.count({ where: { status: "APPROVED" } }),
    prisma.promptTemplate.count({ where: { status: "REJECTED" } }),
  ]);
  return { total, pending, approved, rejected };
}

// 批量审核通过
export async function batchApprovePromptTemplates(ids: string[]) {
  await prisma.promptTemplate.updateMany({
    where: { id: { in: ids } },
    data: { status: "APPROVED" },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

// 批量拒绝
export async function batchRejectPromptTemplates(ids: string[]) {
  await prisma.promptTemplate.updateMany({
    where: { id: { in: ids } },
    data: { status: "REJECTED" },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}

// 批量删除
export async function batchDeletePromptTemplates(ids: string[]) {
  await prisma.promptTemplate.deleteMany({
    where: { id: { in: ids } },
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  revalidatePath("/dashboard/prompt-templates");
  revalidatePath("/prompt-templates");
  return { success: true };
}
