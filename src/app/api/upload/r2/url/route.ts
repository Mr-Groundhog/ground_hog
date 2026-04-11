import { NextRequest, NextResponse } from 'next/server';
import { getPublicUrl } from '@/lib/r2';

/**
 * 获取 R2 文件访问 URL
 *
 * GET /api/upload/r2/url?key=blog/123456-abc.png
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, message: '缺少 key 参数' },
        { status: 400 }
      );
    }

    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
    });
  } catch (error) {
    console.error('Failed to get R2 file URL:', error);
    return NextResponse.json(
      { success: false, message: '获取文件 URL 失败' },
      { status: 500 }
    );
  }
}
