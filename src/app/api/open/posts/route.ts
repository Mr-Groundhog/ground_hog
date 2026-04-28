/**
 * Open API - 文章接口
 * 
 * GET  /api/open/posts       - 查询文章列表（支持分页、搜索、状态/分类过滤）
 * POST /api/open/posts       - 发布新文章（支持 Markdown 内容、草稿/发布状态）
 * 
 * 注意：发布文章时，OPEN_API_USER_ID 对应的用户必须是 ADMIN 角色
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { Result, HttpCode, RequestHelper } from "@/lib/http";
import { authenticateRequest } from "@/lib/api-key";
import { postSchema } from "@/app/dashboard/posts/schema";

/**
 * GET /api/open/posts - 查询文章列表
 * 
 * Query 参数:
 * - page: 页码（默认 1）
 * - pageSize: 每页条数（默认 10，最大 100）
 * - status: 过滤状态（DRAFT / PUBLISHED / ARCHIVED）
 * - keyword: 搜索关键词（匹配标题和摘要）
 * - categoryId: 按分类筛选
 * - sortBy: 排序字段（createdAt / viewCount，默认 createdAt）
 * - sortOrder: 排序方向（asc / desc，默认 desc）
 */
export async function GET(request: NextRequest) {
  // 验证 API Key
  const auth = authenticateRequest(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 10));
  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") === "asc" ? "asc" : "desc";

  // 构建查询条件
  const where: Record<string, unknown> = {};
  if (status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    where.status = status;
  }
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { excerpt: { contains: keyword } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // 并发查询数据和总数
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { username: true, nickname: true, avatar: true } },
        _count: { select: { comments: true, interactions: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return Result.success({
    items: items.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      viewCount: post.viewCount,
      category: post.category,
      author: post.user,
      commentCount: post._count.comments,
      likeCount: post._count.interactions,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

/**
 * 验证配置的用户是否具有管理员权限
 */
async function validateAdminUser(userId: string): Promise<{ valid: boolean; message?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });

  if (!user) {
    return { valid: false, message: "配置的用户不存在" };
  }

  if (!user.isActive) {
    return { valid: false, message: "配置的用户已被禁用" };
  }

  if (user.role !== "ADMIN") {
    return { valid: false, message: "配置的用户必须是管理员角色（ADMIN）" };
  }

  return { valid: true };
}

/**
 * POST /api/open/posts - 发布文章
 * 
 * 请求体:
 * - title: 文章标题（必填，最长 100 字符）
 * - slug: URL 路径（选填，不传自动生成）
 * - content: Markdown 内容（必填）
 * - excerpt: 摘要（选填）
 * - coverImage: 封面图 URL（选填）
 * - categoryId: 分类 ID（选填）
 * - status: 状态（选填，默认 DRAFT）
 */
export async function POST(request: NextRequest) {
  // 验证 API Key
  const auth = authenticateRequest(request);
  if ("error" in auth) return auth.error;

  // 解析请求体
  const { data: body, error: parseError } =
    await RequestHelper.safeParse<Record<string, unknown>>(request);
  if (parseError || !body) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, parseError || "请求体为空");
  }

  // 校验字段
  const validation = postSchema.safeParse(body);
  if (!validation.success) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, validation.error.issues[0].message);
  }

  const { slug, ...rest } = validation.data;
  const finalSlug = slug || `post-${Date.now()}`;

  // 检查 slug 唯一性
  const exist = await prisma.post.findUnique({ where: { slug: finalSlug } });
  if (exist) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, `Slug "${finalSlug}" 已存在`);
  }

  // 获取文章归属的用户 ID 并验证权限
  const userId = env.OPEN_API_USER_ID;
  if (!userId) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "OPEN_API_USER_ID 未配置");
  }

  // 验证该用户必须是管理员角色
  const adminValidation = await validateAdminUser(userId);
  if (!adminValidation.valid) {
    return Result.error(
      HttpCode.INTERNAL_SERVER_ERROR,
      `Open API 配置错误：${adminValidation.message}`
    );
  }

  // 创建文章
  const post = await prisma.post.create({
    data: {
      ...rest,
      slug: finalSlug,
      userId,
      publishedAt: rest.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return Result.success(
    {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      createdAt: post.createdAt,
    },
    "文章发布成功"
  );
}
