import nodemailer from 'nodemailer'
import { env } from '@/lib/env'

// 邮件配置接口
interface MailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Gmail SMTP 配置
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // 使用 SSL
    auth: {
      user: env.GMAIL_USER, // Gmail 账户
      pass: env.GMAIL_APP_PASSWORD, // 应用专用密码
    },
  })
}

// 发送邮件函数
export async function sendMail(options: MailOptions) {
  try {
    // 验证环境变量
    if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
      throw new Error('缺少 Gmail 配置，请检查环境变量 GMAIL_USER 和 GMAIL_APP_PASSWORD')
    }

    const transporter = createTransporter()

    // 验证连接
    await transporter.verify()

    const mailOptions = {
      from: `"${env.SITE_NAME || '一梦五千年'}" <${env.GMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('邮件发送成功:', info.messageId)
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    }
  } catch (error) {
    console.error('邮件发送失败:', error)
    throw new Error(`邮件发送失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 发送验证码邮件
export async function sendVerificationCode(to: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${env.SITE_NAME || '一梦五千年'}</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">邮箱验证码</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">您好！</h2>
        
        <p style="color: #666; line-height: 1.6;">
          您正在请求获取验证码，您的验证码是：
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="
            display: inline-block;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #667eea;
            background: #f8f9fa;
            padding: 15px 25px;
            border-radius: 8px;
            border: 2px dashed #667eea;
          ">
            ${code}
          </span>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          该验证码将在 <strong>10分钟</strong> 后失效，请尽快使用。
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          如果您没有请求此验证码，请忽略此邮件。<br>
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} ${env.SITE_NAME || '一梦五千年'}. All rights reserved.
      </div>
    </div>
  `

  return await sendMail({
    to,
    subject: `[${env.SITE_NAME || '一梦五千年'}] 邮箱验证码`,
    html,
  })
}

// 发送通知邮件
export async function sendNotification(to: string, title: string, content: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${env.SITE_NAME || '一梦五千年'}</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">系统通知</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">${title}</h2>
        
        <div style="color: #666; line-height: 1.6; white-space: pre-wrap;">
          ${content}
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} ${env.SITE_NAME || '一梦五千年'}. All rights reserved.
      </div>
    </div>
  `

  return await sendMail({
    to,
    subject: `[${env.SITE_NAME || '一梦五千年'}] ${title}`,
    html,
  })
}