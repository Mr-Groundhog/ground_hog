"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";

const PROMPT_TEMPLATES_TAG = "public-prompt-templates";

/** 去除 HTML 标签，防止 XSS 注入 */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

// 用户提交 schema（仅分类、标题、内容）
const applySchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题最多100字"),
  content: z.string().min(1, "提示词内容不能为空").max(10000, "提示词内容最多10000字"),
  category: z.string().min(1, "分类不能为空"),
});

// 每日提交次数限制
const DAILY_SUBMIT_LIMIT = 5;

export async function applyPromptTemplate(data: z.infer<typeof applySchema>) {
  const validated = applySchema.parse(data);

  // XSS 防护：去除所有 HTML 标签
  const sanitized = {
    title: stripHtml(validated.title),
    content: stripHtml(validated.content),
    category: validated.category,
  };

  // 检查每日提交次数限制（按标题+内容去重，防止同一条重复提交）
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySubmissions = await prisma.promptTemplate.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  if (todaySubmissions >= DAILY_SUBMIT_LIMIT) {
    throw new Error(`今日提交次数已达上限（${DAILY_SUBMIT_LIMIT} 次），请明天再试`);
  }

  await prisma.promptTemplate.create({
    data: {
      ...sanitized,
      description: sanitized.content.slice(0, 200),
      status: "PENDING",
    },
  });
  
  return { success: true };
}

// 获取公开模板（APPROVED）
export async function getPublicPromptTemplates() {
  return await prisma.promptTemplate.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}

// 获取热门模板（按点赞数排序，取前10）
export async function getHotPromptTemplates(limit: number = 10) {
  return await prisma.promptTemplate.findMany({
    where: { status: "APPROVED" },
    orderBy: { likeCount: "desc" },
    take: limit,
  });
}

// 点赞
export async function likePromptTemplate(templateId: string, ip: string) {
  // 检查是否已点赞
  const existingLike = await prisma.promptLike.findUnique({
    where: {
      templateId_ip: {
        templateId,
        ip,
      },
    },
  });

  if (existingLike) {
    // 取消点赞
    await prisma.promptLike.delete({
      where: { id: existingLike.id },
    });
    await prisma.promptTemplate.update({
      where: { id: templateId },
      data: { likeCount: { decrement: 1 } },
    });
    return { liked: false };
  } else {
    // 点赞
    await prisma.promptLike.create({
      data: { templateId, ip },
    });
    await prisma.promptTemplate.update({
      where: { id: templateId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true };
  }
}

// 检查是否已点赞
export async function checkLiked(templateId: string, ip: string) {
  const like = await prisma.promptLike.findUnique({
    where: {
      templateId_ip: {
        templateId,
        ip,
      },
    },
  });
  return { liked: !!like };
}

// 获取评论
export async function getPromptComments(templateId: string) {
  return await prisma.promptComment.findMany({
    where: { templateId },
    orderBy: { createdAt: "desc" },
  });
}

// 添加评论
const commentSchema = z.object({
  templateId: z.string(),
  author: z.string().min(1, "昵称不能为空").max(50, "昵称最多50字"),
  content: z.string().min(1, "评论内容不能为空").max(500, "评论最多500字"),
});

export async function addPromptComment(data: z.infer<typeof commentSchema>) {
  const validated = commentSchema.parse(data);
  
  // XSS 防护：去除 HTML 标签
  const sanitized = {
    templateId: validated.templateId,
    author: stripHtml(validated.author),
    content: stripHtml(validated.content),
  };

  await prisma.promptComment.create({
    data: sanitized,
  });

  revalidateTag(PROMPT_TEMPLATES_TAG);
  return { success: true };
}

// 增加浏览次数
export async function incrementViewCount(templateId: string) {
  await prisma.promptTemplate.update({
    where: { id: templateId },
    data: { viewCount: { increment: 1 } },
  });
}

// 增加使用次数（复制时调用）
export async function incrementUseCount(templateId: string) {
  await prisma.promptTemplate.update({
    where: { id: templateId },
    data: { useCount: { increment: 1 } },
  });
}
