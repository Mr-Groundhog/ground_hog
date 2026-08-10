"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { importCodesSchema } from "./schema";

const CREDIT_CODES_TAG = "dashboard-credit-codes";

/** 公益站额度兑换入口兜底地址（后台未配置时使用） */
export const DEFAULT_REDEEM_URL = "https://fapi.leileihog.top";

/** 读取公益站额度兑换入口地址：优先后台配置，未配置则兜底默认地址 */
export async function getRedeemUrl(): Promise<string> {
  try {
    const cfg = await prisma.creditActivityConfig.findUnique({
      where: { id: "singleton" },
    });
    return cfg?.redeemUrl?.trim() || DEFAULT_REDEEM_URL;
  } catch {
    return DEFAULT_REDEEM_URL;
  }
}

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

/** 导入奖池：批量创建额度码（自动生成批次 id） */
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
    return { success: true, created: 0, skipped: unique.length, batchId: null, message: "全部码已存在，未导入" };
  }

  // 每批导入统一生成一个批次 id
  const batchId = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  await prisma.creditCode.createMany({
    data: toCreate.map((code) => ({
      code,
      amount: validated.amount,
      batchId,
      batchNote: validated.batchNote || null,
    })),
  });

  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return {
    success: true,
    created: toCreate.length,
    skipped: unique.length - toCreate.length,
    batchId,
  };
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

/* ----------------------------- 批次管理 ----------------------------- */

const CREDIT_BATCHES_TAG = "dashboard-credit-batches";

/** 批次列表：按 batchId 分组统计，并标注哪个是当前活动批次 */
export async function getBatches() {
  await assertAdmin();
  const cfg = await prisma.creditActivityConfig.findUnique({
    where: { id: "singleton" },
  });
  const activeBatchId = cfg?.activeBatchId ?? null;

  const groups = await prisma.creditCode.groupBy({
    by: ["batchId"],
    _count: { _all: true },
    orderBy: { _count: { batchId: "desc" } },
  });

  const batches = await Promise.all(
    groups.map(async (g) => {
      const [available, claimed, disabled, sample] = await Promise.all([
        prisma.creditCode.count({ where: { batchId: g.batchId, status: "AVAILABLE" } }),
        prisma.creditCode.count({ where: { batchId: g.batchId, status: "CLAIMED" } }),
        prisma.creditCode.count({ where: { batchId: g.batchId, status: "DISABLED" } }),
        prisma.creditCode.findFirst({
          where: { batchId: g.batchId },
          orderBy: { createdAt: "asc" },
          select: { batchNote: true, createdAt: true },
        }),
      ]);
      return {
        batchId: g.batchId,
        total: g._count._all,
        available,
        claimed,
        disabled,
        batchNote: sample?.batchNote ?? null,
        createdAt: sample?.createdAt.toISOString() ?? null,
        isActive: g.batchId === activeBatchId,
      };
    })
  );

  return { batches, activeBatchId };
}

/** 某批次的码明细（分页） */
export async function getBatchCodes(batchId: string, page = 1, limit = 30) {
  await assertAdmin();
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.creditCode.findMany({
      where: { batchId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.creditCode.count({ where: { batchId } }),
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
}

/** 设置当前活动抽奖批次（batchId 为 null 表示不限批次） */
export async function setActiveBatch(batchId: string | null) {
  await assertAdmin();
  if (batchId) {
    const exists = await prisma.creditCode.findFirst({ where: { batchId } });
    if (!exists) throw new Error("批次不存在");
  }
  await prisma.creditActivityConfig.upsert({
    where: { id: "singleton" },
    update: { activeBatchId: batchId },
    create: { id: "singleton", activeBatchId: batchId },
  });
  revalidateTag(CREDIT_BATCHES_TAG);
  revalidateTag(CREDIT_CODES_TAG);
  revalidatePath("/dashboard/credit-codes");
  return { success: true };
}

/** 设置公益站额度兑换入口地址（空字符串表示清除，回落到默认兜底地址） */
export async function setRedeemUrl(url: string) {
  await assertAdmin();
  const trimmed = (url || "").trim();
  if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
    throw new Error("请输入合法的 http(s) 链接");
  }
  await prisma.creditActivityConfig.upsert({
    where: { id: "singleton" },
    update: { redeemUrl: trimmed || null },
    create: { id: "singleton", redeemUrl: trimmed || null },
  });
  revalidatePath("/dashboard/public-stations");
  return { success: true, redeemUrl: trimmed || DEFAULT_REDEEM_URL };
}
