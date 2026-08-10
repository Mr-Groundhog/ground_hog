import { headers } from "next/headers";

/**
 * 从请求头中解析客户端真实 IP。
 * 适用于 Server Action 内部调用（读取 next/headers 的 headers()）。
 * 优先使用 x-forwarded-for（取第一段），回退到 x-real-ip，本地开发回退 127.0.0.1。
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  let ip =
    h.get("x-forwarded-for") ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "";
  if (!ip) return "127.0.0.1";
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  return ip || "127.0.0.1";
}
