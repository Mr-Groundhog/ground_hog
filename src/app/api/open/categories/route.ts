/**
 * Open API - 查询分类列表
 * 
 * GET /api/open/categories
 * 
 * Query 参数:
 * - hasPosts: 是否只返回有关联文章的分类（true / false，默认 false）
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Result } from "@/lib/http";
import { authenticateRequest } from "@/lib/api-key";

export async function GET(request: NextRequest) {
  // 验证 API Key
  const auth = authenticateRequest(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const hasPosts = searchParams.get("hasPosts") === "true";

  const where: Record<string, unknown> = {};
  if (hasPosts) {
    where.posts = { some: {} };
  }

  const categories = await prisma.category.findMany({
    where,
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Result.success(
    categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      postCount: cat._count.posts,
      createdAt: cat.createdAt,
    }))
  );
}
