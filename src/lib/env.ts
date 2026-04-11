// 环境变量配置
export const env = {
  // Gmail 配置
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
  
  // 网站配置
  SITE_NAME: process.env.SITE_NAME || '一梦五千年',
  SITE_URL: process.env.SITE_URL || 'http://localhost:9527',
  
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Redis 配置
  REDIS_URL: process.env.REDIS_URL || '',
  
  // JWT 密钥
  JWT_SECRET: process.env.JWT_SECRET || '',

  // 七牛云配置
  QINIU: {
    accessKey: process.env.QINIU_AK || '',
    secretKey: process.env.QINIU_SK || '',
    bucket: process.env.QINIU_BUCKET || '',
    domain: process.env.NEXT_PUBLIC_QINIU_DOMAIN || '',
  },

  // Cloudflare R2 配置
  R2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || '',
    domain: process.env.R2_DOMAIN || '',
  },

  // 上传配置
  UPLOAD_PROVIDER: (process.env.UPLOAD_PROVIDER || 'r2') as 'qiniu' | 'r2',
}