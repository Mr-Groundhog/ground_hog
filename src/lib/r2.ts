import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

/**
 * R2 S3 客户端单例
 */
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2.accessKeyId,
        secretAccessKey: env.R2.secretAccessKey,
      },
    });
  }
  return r2Client;
}

/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @param folder 目标文件夹，如 'avatar'、'blog'、'tools'
 */
export function generateKey(originalName: string, folder: string = 'blog'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'png';
  return `${folder}/${timestamp}-${random}.${ext}`;
}

/**
 * 生成 Presigned 上传 URL（用于前端直传）
 * @param key 文件存储路径
 * @param expiresIn 过期时间（秒），默认 3600（1小时）
 */
export async function generateUploadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: env.R2.bucket,
    Key: key,
    ContentType: 'image/*',
    // ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return uploadUrl;
}

/**
 * 获取文件访问 URL（公开访问）
 * @param key 文件存储路径
 */
export function getPublicUrl(key: string): string {
  // 如果配置了自定义域名，使用自定义域名
  if (env.R2.domain) {
    return `${env.R2.domain}/${key}`;
  }
  // 否则使用 R2 公共访问 URL
  return `https://${env.R2.bucket}.${env.R2.accountId}.r2.cloudflarestorage.com/${key}`;
}

/**
 * 上传文件到 R2（服务端直接上传）
 * @param key 文件存储路径
 * @param body 文件内容（Buffer 或 ReadableStream）
 * @param contentType MIME 类型
 */
export async function uploadToR2(
  key: string,
  body: Buffer | ReadableStream,
  contentType: string = 'image/png'
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: env.R2.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    // ACL: 'public-read',
  });

  await client.send(command);
  return getPublicUrl(key);
}
