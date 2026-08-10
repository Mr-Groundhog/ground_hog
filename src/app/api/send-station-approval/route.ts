import { NextRequest, NextResponse } from "next/server";
import { sendStationApproveEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, url, creditCode, amount, expireAt } = body;

    if (!email || !url || !creditCode || amount === undefined || !expireAt) {
      return NextResponse.json(
        { error: "缺少必要参数: email / url / creditCode / amount / expireAt" },
        { status: 400 }
      );
    }

    // 获取客户端IP
    let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    if (!ip) {
      ip = "127.0.0.1";
    }
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    const result = await sendStationApproveEmail(
      email,
      { url, creditCode, amount, expireAt },
      ip
    );

    return NextResponse.json({
      success: true,
      message: "邮件发送成功",
      data: result,
    });
  } catch (error: any) {
    console.error("公益站审核邮件发送错误:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "邮件发送失败",
      },
      { status: 500 }
    );
  }
}
