"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { importCodesSchema } from "./schema";

const CREDIT_CODES_TAG = "dashboard-credit-codes";

/** 后台敏感操作前置校验：必须是 ADMIN 角色，否则抛错（Server Action 是公开可调用端点） */
async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("无权限执行该操作");
  }
}

const getCachedCreditCodes = unstable_cache(
  async (page: number, limit: number, status?: string, search?: string) => {
    const skip = (page - 1) * limit;
    const where: Prisma.CreditCodeWhereInput = {};
    if (status) where.status = status as any;
    if (search) where.code = { contains: search };

    const [data, total] = await Promise.all([
      prisma.creditCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditCode.count({ where }),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        amount: d.amount.toString(),
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  [CREDIT_CODES_TAG],
  { revalidate: 300, tags: [CREDIT_CODES_TAG] }
);

export async function getCreditCodes({
  page = 1,
  limit = 20,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  return getCachedCreditCodes(page, limit, status, search);
}

/** 导入奖池：批量创建额度码 */
export async function importCreditCodes(data: {
  codes: string;
  amount: number;
  batchNote?: string;
}) {
  await assertAdmin();
  const validated = importCodesSchema.parse(data);
  const list = validated.codes
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 去重（同一次导入内）
  const unique = Array.from(new Set(list));

  // 过滤掉已存在的码
  const existing = await prisma.creditCode.findMany({
    where: { code: { in: unique } },
    select: { code: true },
  });
  const existingSet = new Set(existing.map((e) => e.code));
  const toCreate = unique.filter((c) => !existingSet.has(c));

  if (toCreate.length === 0) {
    return { success: true, created: 0, skipped: unique.length, message: "全部码已存在，未导入" };
  }

  await prisma.creditCode.createMany({
    data: toCreate.map((code) => ({
      code,
      amount: validated.amount,
      batchNote: validated.batchNote || null,
    })),
  });

  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true, created: toCreate.length, skipped: unique.length - toCreate.length };
}

/** 停用某个码（仅未领取的可停用） */
export async function disableCreditCode(id: string) {
  await assertAdmin();
  await prisma.creditCode.update({
    where: { id },
    data: { status: "DISABLED" },
  });
  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true };
}

/** 删除某个码 */
export async function deleteCreditCode(id: string) {
  await assertAdmin();
  await prisma.creditCode.delete({ where: { id } });
  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true };
}

/* ----------------------------- 评论管理 ----------------------------- */

const CREDIT_COMMENTS_TAG = "dashboard-credit-comments";

const getCachedCreditComments = unstable_cache(
  async (page: number, limit: number, search?: string) => {
    const skip = (page - 1) * limit;
    const where: Prisma.CreditCommentWhereInput = {};
    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.creditComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditComment.count({ where }),
    ]);

    return {
      data: data.map((c) => ({
        ...c,
        amount: c.amount ? c.amount.toString() : null,
        createdAt: c.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  [CREDIT_COMMENTS_TAG],
  { revalidate: 300, tags: [CREDIT_COMMENTS_TAG] }
);

export async function getCreditComments({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  return getCachedCreditComments(page, limit, search);
}

/** 删除单条评论 */
export async function deleteCreditComment(id: string) {
  await assertAdmin();
  await prisma.creditComment.delete({ where: { id } });
  revalidateTag(CREDIT_COMMENTS_TAG);
  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true };
}

/** 批量删除评论 */
export async function batchDeleteCreditComments(ids: string[]) {
  await assertAdmin();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: true, deleted: 0 };
  }
  await prisma.creditComment.deleteMany({ where: { id: { in: ids } } });
  revalidateTag(CREDIT_COMMENTS_TAG);
  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true, deleted: ids.length };
}
