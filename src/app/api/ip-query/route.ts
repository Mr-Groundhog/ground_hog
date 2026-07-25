import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetIp = url.searchParams.get("ip")?.trim() || "";
  const apiUrl = targetIp
    ? `https://ip9.com.cn/get?ip=${encodeURIComponent(targetIp)}`
    : "https://ip9.com.cn/get";

  try {
    const res = await fetch(apiUrl, {
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
        { ret: 500, data: null, qt: 0, message: `上游接口返回 ${res.status}` },
        { status: 200 }
      );
    }

    let data: { ret?: number; data?: unknown; qt?: number };
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ret: 500, data: null, qt: 0, message: "上游接口返回内容不是有效 JSON" },
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
      { ret: 500, data: null, qt: 0, message: "请求上游接口失败" },
      { status: 200 }
    );
  }
}
