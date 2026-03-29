import { NextRequest, NextResponse } from 'next/server';
import { getUploadToken } from '@/lib/qiniu';

/**
 * 获取七牛云上传凭证 API（私有空间专用）
 * 前端直传方案：只返回上传 token，前端直接上传到七牛云
 * 私有空间需要传入 key 参数生成 bucket:key 格式的 token
 */
export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取 key
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { success: false, message: '缺少 key 参数' },
        { status: 400 }
      );
    }
    
    const token = getUploadToken(key);
    
    return NextResponse.json({
      success: true,
      token,
      key,
    });
  } catch (error) {
    console.error('Failed to generate upload token:', error);
    return NextResponse.json(
      { success: false, message: '获取上传凭证失败' },
      { status: 500 }
    );
  }
}