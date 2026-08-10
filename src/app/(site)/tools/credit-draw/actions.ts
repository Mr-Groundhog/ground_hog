"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { getClientIp } from "@/lib/ip";

/* ----------------------------- 评论领额度 ----------------------------- */

const commentSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(20, "昵称过长"),
  content: z.string().min(1, "评论不能为空").max(500, "评论过长"),
});

/**
 * 评论即抽码：提交评论（上墙），若该 IP 未参与过则从奖池随机领取一张可用额度码。
 * 奖池为空时评论仍上墙，但标记已抽空。
 */
export async function submitComment(data: z.infer<typeof commentSchema>) {
  const validated = commentSchema.parse(data);
  const ip = await getClientIp();

  // IP 限领一次
  const existed = await prisma.creditComment.findFirst({ where: { ip } });
  if (existed) {
    return { success: false, limited: true, message: "你已参与过本次活动啦~" };
  }

  // 事务内原子领取：随机取一条 AVAILABLE 码并标记 CLAIMED
  const claimed = await prisma.$transaction(async (tx) => {
    const code = await tx.creditCode.findFirst({
      where: { status: "AVAILABLE" },
      orderBy: { id: "asc" },
      // 随机偏移取一条，避免总是抽最前面的码
      skip: Math.floor(Math.random() * Math.max(await tx.creditCode.count({ where: { status: "AVAILABLE" } }), 1)),
    });

    if (!code) return null;

    const updated = await tx.creditCode.update({
      where: { id: code.id },
      data: { status: "CLAIMED", claimIp: ip },
    });
    return updated;
  });

  await prisma.creditComment.create({
    data: {
      nickname: validated.nickname,
      content: validated.content,
      ip,
      claimed: !!claimed,
      code: claimed?.code ?? null,
      amount: claimed?.amount ?? null,
    },
  });

  if (!claimed) {
    return {
      success: true,
      claimed: false,
      message: "评论已上墙，但奖池已空，下次再来吧~",
    };
  }

  return {
    success: true,
    claimed: true,
    code: claimed.code,
    amount: claimed.amount.toString(),
    message: "恭喜获得额度！",
  };
}

/** 公开评论墙（最新 50 条） */
export async function getRecentComments() {
  const list = await prisma.creditComment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      nickname: true,
      content: true,
      claimed: true,
      amount: true,
      createdAt: true,
    },
  });
  return list.map((c) => ({
    ...c,
    amount: c.amount ? c.amount.toString() : null,
  }));
}

/** 奖池进度：总码数 / 已领取 / 剩余 */
export async function getPoolStats() {
  const [total, claimed] = await Promise.all([
    prisma.creditCode.count(),
    prisma.creditCode.count({ where: { status: "CLAIMED" } }),
  ]);
  const available = total - claimed;
  return { total, claimed, available };
}

/* ----------------------------- 共建公益站 ----------------------------- */

const stationSchema = z.object({
  url: z.string().url("请输入有效的站点 URL"),
  keyValue: z.string().min(1, "站点 key 不能为空"),
  models: z.string().min(1, "支持模型不能为空").max(200, "支持模型描述过长"),
  email: z.string().email("请输入有效的邮箱"),
});

function genExtractCode(): string {
  // 8 位提取码：时间戳 + 随机
  const ts = Date.now().toString(36).slice(-4);
  const rand = Math.random().toString(36).slice(2, 6);
  return (ts + rand).toUpperCase();
}

/**
 * 提交公益站申请：生成提取码返回给用户，记录进入 PENDING 待审核。
 */
export async function submitStation(data: z.infer<typeof stationSchema>) {
  const validated = stationSchema.parse(data);

  // 保证提取码唯一
  let extractCode = genExtractCode();
  // 极小概率冲突：循环查重
  while (true) {
    const hit = await prisma.publicStation.findUnique({
      where: { extractCode },
      select: { id: true },
    });
    if (!hit) break;
    extractCode = genExtractCode();
  }

  await prisma.publicStation.create({
    data: {
      email: validated.email,
      url: validated.url,
      keyValue: validated.keyValue,
      models: validated.models,
      extractCode,
      status: "PENDING",
    },
  });

  return { success: true, extractCode };
}

interface StationQueryResult {
  found: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  url?: string;
  keyMasked?: string;
  models?: string;
  emailMasked?: string;
  creditCode?: string | null;
  amount?: string | null;
  expireAt?: string | null;
  reviewNote?: string | null;
}

function maskKey(key: string): string {
  if (key.length <= 8) return key.slice(0, 2) + "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const head = name.slice(0, 2);
  return `${head}***@${domain}`;
}

/**
 * 凭提取码查询提交内容与审核状态。
 * 安全：额度码仅当 status === APPROVED 才返回，杜绝未审核泄露。
 */
export async function queryStation(extractCode: string): Promise<StationQueryResult> {
  const code = (extractCode || "").trim().toUpperCase();
  if (!code) {
    return { found: false };
  }

  const station = await prisma.publicStation.findUnique({
    where: { extractCode: code },
  });

  if (!station) {
    return { found: false };
  }

  const result: StationQueryResult = {
    found: true,
    status: station.status,
    url: station.url,
    keyMasked: maskKey(station.keyValue),
    models: station.models,
    emailMasked: maskEmail(station.email),
    creditCode: null,
    amount: null,
    expireAt: null,
    reviewNote: station.reviewNote,
  };

  if (station.status === "APPROVED") {
    result.creditCode = station.creditCode ?? null;
    result.amount = station.amount ? station.amount.toString() : null;
    result.expireAt = station.expireAt ? station.expireAt.toISOString() : null;
  }

  return result;
}
