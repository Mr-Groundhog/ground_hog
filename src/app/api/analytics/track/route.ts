import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uv, pageUrl, device, referrer } = body;

    // Get IP address
    let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    if (!ip) {
      // Fallback for local development
      ip = "127.0.0.1";
    }
    // If x-forwarded-for contains multiple IPs, take the first one
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Basic validation
    if (!uv || !pageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 埋点写库不阻塞响应：先把 200 返回给客户端，DB 写入在响应发出后用 after() 异步完成
    after(async () => {
      try {
        await prisma.siteVisit.create({
          data: {
            uv,
            pageUrl,
            device,
            referrer: referrer || null,
            ip: ip as string,
          },
        });
      } catch (err) {
        console.error("Analytics write (after) error:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
