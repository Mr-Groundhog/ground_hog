import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM_BASE = "https://so.252035.xyz/api/search";

// 允许的查询参数白名单，避免透传任意参数
const ALLOWED_PARAMS = [
  "kw",
  "res",
  "src",
  "ext",
  "cloud_types",
  "filter",
  "conc",
] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kw = url.searchParams.get("kw")?.trim();

  if (!kw) {
    return NextResponse.json(
      { code: 400, message: "缺少搜索关键词 kw", data: null },
      { status: 200 }
    );
  }

  const target = new URL(UPSTREAM_BASE);
  for (const key of ALLOWED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value !== null && value !== "") {
      target.searchParams.set(key, value);
    }
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 },
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { code: res.status, message: `上游接口返回 ${res.status}`, data: null },
        { status: 200 }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { code: 500, message: "上游接口返回内容不是有效 JSON", data: null },
        { status: 200 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { code: 500, message: "请求上游接口失败", data: null },
      { status: 200 }
    );
  }
}
