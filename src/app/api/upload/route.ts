import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { generateKey as generateR2Key, uploadToR2 } from '@/lib/r2';
import { generateKey as generateQiniuKey, getUploadToken } from '@/lib/qiniu';

/**
 * 统一上传 API
 * 根据 UPLOAD_PROVIDER 配置自动选择存储服务
 * 前端只需调用 /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'blog';

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

    const provider = env.UPLOAD_PROVIDER;

    if (provider === 'r2') {
      // Cloudflare R2 上传
      const key = generateR2Key(file.name, folder);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const url = await uploadToR2(key, buffer, file.type);

      return NextResponse.json({ success: true, url, key, provider: 'r2' });
    } else {
      // 七牛云上传（需要先获取 token，再上传）
      const key = generateQiniuKey(file.name, folder);
      const token = getUploadToken(key);

      // 构建七牛云上传表单
      const qiniuFormData = new FormData();
      qiniuFormData.append('file', file);
      qiniuFormData.append('token', token);
      qiniuFormData.append('key', key);

      const uploadRes = await fetch('https://up-as0.qiniup.com', {
        method: 'POST',
        body: qiniuFormData,
      });

      if (!uploadRes.ok) {
        throw new Error('七牛云上传失败');
      }

      const url = `${env.QINIU.domain}/${key}`;
      return NextResponse.json({ success: true, url, key, provider: 'qiniu' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: '上传失败' },
      { status: 500 }
    );
  }
}
