/**
 * Open API - 按 Slug 查询文章详情
 * 
 * GET /api/open/posts/slug/:slug
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Result, HttpCode } from "@/lib/http";
import { authenticateRequest } from "@/lib/api-key";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 验证 API Key
  const auth = authenticateRequest(_request);
  if ("error" in auth) return auth.error;

  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true } },
      user: { select: { username: true, nickname: true, avatar: true, bio: true } },
      _count: { select: { comments: true, interactions: true } },
    },
  });

  if (!post) {
    return Result.error(HttpCode.NOT_FOUND, "文章不存在");
  }

  // 估算阅读时间
  const readTime = `${Math.ceil(post.content.length / 500)} 分钟读完`;

  return Result.success({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    status: post.status,
    viewCount: post.viewCount,
    readTime,
    category: post.category,
    author: post.user,
    commentCount: post._count.comments,
    likeCount: post._count.interactions,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
  });
}
