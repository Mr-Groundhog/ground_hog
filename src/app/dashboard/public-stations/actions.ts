"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { sendStationApproveEmail } from "@/lib/email-service";
import { headers } from "next/headers";

const PUBLIC_STATIONS_TAG = "dashboard-public-stations";

const getCachedStations = unstable_cache(
  async (page: number, limit: number, status?: string, search?: string) => {
    const skip = (page - 1) * limit;
    const where: Prisma.PublicStationWhereInput = {};
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { url: { contains: search } },
        { email: { contains: search } },
        { models: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.publicStation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.publicStation.count({ where }),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        amount: d.amount ? d.amount.toString() : null,
        createdAt: d.createdAt.toISOString(),
        reviewedAt: d.reviewedAt ? d.reviewedAt.toISOString() : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  [PUBLIC_STATIONS_TAG],
  { revalidate: 300, tags: [PUBLIC_STATIONS_TAG] }
);

export async function getPublicStations({
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
  return getCachedStations(page, limit, status, search);
}

/**
 * 审核通过：更新记录为 APPROVED，写入管理员手动粘贴的额度码、额度、失效时间。
 * 发邮件由前端 fetch /api/send-station-approval 完成（route 内取 IP），
 * 这里仅返回发邮件所需的字段。
 */
export async function approveStation(
  id: string,
  data: {
    creditCode: string;
    amount: number;
    expireAt: string; // ISO 字符串
    reviewNote?: string;
  }
) {
  if (!data.creditCode.trim()) {
    throw new Error("额度码不能为空");
  }
  if (!data.amount || data.amount <= 0) {
    throw new Error("额度必须为正数");
  }
  if (!data.expireAt) {
    throw new Error("请选择失效时间");
  }

  const updated = await prisma.publicStation.update({
    where: { id },
    data: {
      status: "APPROVED",
      creditCode: data.creditCode.trim(),
      amount: data.amount,
      expireAt: new Date(data.expireAt),
      reviewNote: data.reviewNote || null,
      reviewedAt: new Date(),
    },
  });

  revalidateTag(PUBLIC_STATIONS_TAG);
  revalidatePath("/dashboard/public-stations");

  return {
    success: true,
    // 供前端发邮件使用
    email: updated.email,
    url: updated.url,
    creditCode: updated.creditCode,
    amount: updated.amount.toString(),
    expireAt: updated.expireAt.toISOString(),
  };
}

/** 审核拒绝 */
export async function rejectStation(id: string, reviewNote?: string) {
  await prisma.publicStation.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    },
  });
  revalidateTag(PUBLIC_STATIONS_TAG);
  revalidatePath("/dashboard/public-stations");
  return { success: true };
}

/**
 * 重发审核通过邮件。限制：同一记录每天（东八区 00:00 起算）仅可点击重发一次。
 * 先落库更新 lastEmailedAt 再发邮件；邮件失败不影响限流状态，可稍后重试（次日）。
 */
export async function resendStationEmail(id: string) {
  const station = await prisma.publicStation.findUnique({ where: { id } });
  if (!station) {
    throw new Error("记录不存在");
  }
  if (station.status !== "APPROVED" || !station.creditCode) {
    throw new Error("仅审核通过且已填写额度码的记录可重发");
  }

  // 东八区（UTC+8）当天 00:00 作为限流起点
  const now = new Date();
  const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const dayStart = new Date(
    beijingNow.getUTCFullYear(),
    beijingNow.getUTCMonth(),
    beijingNow.getUTCDate(),
    0,
    0,
    0,
    0
  );
  const dayStartUtc = new Date(dayStart.getTime() - 8 * 60 * 60 * 1000);

  if (station.lastEmailedAt && station.lastEmailedAt > dayStartUtc) {
    const next = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);
    const hh = next.getUTCHours().toString().padStart(2, "0");
    const mm = next.getUTCMinutes().toString().padStart(2, "0");
    throw new Error(`今天已重发过，请于次日 ${hh}:${mm}（北京时间）后再试`);
  }

  // 先记限流时间，避免重复点击穿透
  await prisma.publicStation.update({
    where: { id },
    data: { lastEmailedAt: new Date() },
  });

  const h = await headers();
  let ip = h.get("x-forwarded-for") || h.get("x-real-ip") || "127.0.0.1";
  if (typeof ip === "string" && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  const result = await sendStationApproveEmail(
    station.email,
    {
      url: station.url,
      creditCode: station.creditCode,
      amount: station.amount ? station.amount.toString() : "0",
      expireAt: station.expireAt
        ? station.expireAt.toISOString()
        : new Date().toISOString(),
    },
    ip
  );

  revalidateTag(PUBLIC_STATIONS_TAG);
  revalidatePath("/dashboard/public-stations");
  return { success: true, emailSent: !!result };
}
