import * as qiniu from 'qiniu';
import { env } from './env';

/**
 * 获取七牛云上传 Token（私有空间专用）
 * 私有空间必须使用 bucket:key 格式的 scope
 * 
 * @param key 文件在七牛云的存储路径，如 'blog/xxx.png'
 */
export function getUploadToken(key: string): string {
  const mac = new qiniu.auth.digest.Mac(env.QINIU.accessKey, env.QINIU.secretKey);
  
  // 🔥 私有空间必须这样写：bucket:key
  const scope = `${env.QINIU.bucket}:${key}`;
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
  
  const putPolicy = new qiniu.rs.PutPolicy({ scope, deadline });
  const token = putPolicy.uploadToken(mac);
  
  return token;
}

/**
 * 生成带唯一直通路径的文件名
 * @param originalName 原始文件名
 * @param folder 目标文件夹，如 'blog'
 */
export function generateKey(originalName: string, folder: string = 'blog'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'png';
  return `${folder}/${timestamp}-${random}.${ext}`;
}