import { NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/mailer";

export async function GET() {
  try {
    // 发送测试邮件到你自己
    await sendVerificationCode("ferry101718@gmail.com", "123456");
    return NextResponse.json({
      success: true,
      message: "邮件发送成功"
    });
  } catch (error) {
    console.error("测试邮件发送失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 });
  }
}
