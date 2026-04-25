/**
 * Open API 认证工具
 * 
 * 直接从环境变量中比对固定密钥，无需查库
 * 适用于内部系统间调用的场景
 */

import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * 获取所有合法的 API Key 列表
 * 支持在环境变量中配置多个密钥，方便轮换
 */
function getValidKeys(): string[] {
  return env.OPEN_API_KEYS
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * 从 Authorization header 提取 Bearer Token
 * 
 * 格式: Authorization: Bearer gh_xxx
 */
function extractBearerToken(header: string | null): string | null {
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

/**
 * 验证请求的 API Key
 * 
 * @param request - Next.js Request 对象
 * @returns 认证成功返回 { keyId }，失败返回 { error: Response }
 */
export function authenticateRequest(request: Request): { keyId: string } | { error: NextResponse } {
  const token = extractBearerToken(request.headers.get("authorization"));

  if (!token) {
    return {
      error: NextResponse.json(
        { code: 401, message: "缺少 Authorization Header，请使用 Bearer Token", data: null },
        { status: 401 }
      ),
    };
  }

  // 直接比对固定密钥列表（同步操作，无需查库）
  const validKeys = getValidKeys();
  if (!validKeys.includes(token)) {
    return {
      error: NextResponse.json(
        { code: 401, message: "无效的 API Key", data: null },
        { status: 401 }
      ),
    };
  }

  return { keyId: token.slice(0, 16) }; // 取 key 前 16 位作为标识
}
