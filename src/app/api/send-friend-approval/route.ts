import { NextRequest, NextResponse } from 'next/server';
import { sendFriendApproveEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, siteName } = body;

    if (!email || !siteName) {
      return NextResponse.json(
        { error: '缺少必要参数: email 和 siteName' },
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

    const result = await sendFriendApproveEmail(email, siteName, ip);
    
    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      data: result,
    });

  } catch (error: any) {
    console.error('邮件发送错误:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || '邮件发送失败',
      },
      { status: 500 }
    );
  }
}