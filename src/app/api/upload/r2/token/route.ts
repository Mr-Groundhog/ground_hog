import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl, generateKey } from '@/lib/r2';

/**
 * 获取 R2 上传 Presigned URL
 * 前端直传方案：返回上传 URL，前端直接上传到 R2
 *
 * GET /api/upload/r2/token?filename=xxx.png&folder=avatar
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const folder = searchParams.get('folder') || 'blog';

    if (!filename) {
      return NextResponse.json(
        { success: false, message: '缺少 filename 参数' },
        { status: 400 }
      );
    }

    // 生成唯一 key
    const key = generateKey(filename, folder);

    // 生成上传 URL（1小时有效期）
    const uploadUrl = await generateUploadUrl(key, 3600);

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Failed to generate R2 upload URL:', error);
    return NextResponse.json(
      { success: false, message: '获取上传凭证失败' },
      { status: 500 }
    );
  }
}
