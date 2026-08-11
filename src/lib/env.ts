// 环境变量配置
export const env = {
  // Brevo (Sendinblue) 配置
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  // Brevo SMTP 中继账户（用于发件人邮箱与 SMTP 回退，通常格式为 contact@yourdomain.com 或 Brevo 提供的 smtp 用户名）
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER || '',
  // 经过 Brevo 验证的发件人邮箱（必须在 Brevo 后台 Senders 中验证）
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || '',
  
  // 网站配置
  SITE_NAME: process.env.SITE_NAME || '一梦五千年',
  SITE_URL: process.env.SITE_URL || 'http://localhost:9527',
  
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Redis 配置
  REDIS_URL: process.env.REDIS_URL || '',

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

  // Open API 配置
  OPEN_API_KEYS: process.env.OPEN_API_KEYS || '',
  OPEN_API_USER_ID: process.env.OPEN_API_USER_ID || '',
}