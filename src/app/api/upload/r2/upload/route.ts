import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateKey } from '@/lib/r2';

/**
 * 后端中转上传到 R2（解决跨域问题）
 * 前端通过 FormData 提交文件，后端转发到 R2
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'test';

    if (!file) {
      return NextResponse.json(
        { success: false, message: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: '只支持图片文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    // 生成存储路径
    const key = generateKey(file.name, folder);

    // 转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到 R2
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    return NextResponse.json(
      { success: false, message: '上传失败' },
      { status: 500 }
    );
  }
}
