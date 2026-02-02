// 环境变量配置
export const env = {
  // Gmail 配置
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
  
  // 网站配置
  SITE_NAME: process.env.SITE_NAME || 'Ground Hog',
  SITE_URL: process.env.SITE_URL || 'http://localhost:9527',
  
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Redis 配置
  REDIS_URL: process.env.REDIS_URL || '',
  
  // JWT 密钥
  JWT_SECRET: process.env.JWT_SECRET || '',
}