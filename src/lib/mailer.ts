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

// Brevo (Sendinblue) HTTP API 配置
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// 把附件转换为 Brevo API 所需的 base64 结构
function buildAttachments(attachments?: MailOptions['attachments']) {
  if (!attachments || attachments.length === 0) return undefined
  return attachments.map((att) => ({
    name: att.filename,
    content:
      typeof att.content === 'string'
        ? Buffer.from(att.content).toString('base64')
        : att.content.toString('base64'),
    contentType: att.contentType,
  }))
}

// 发送邮件函数（通过 Brevo HTTP API）
export async function sendMail(options: MailOptions) {
  try {
    // 验证环境变量
    if (!env.BREVO_API_KEY) {
      throw new Error('缺少 Brevo 配置，请检查环境变量 BREVO_API_KEY')
    }

    const toList = (Array.isArray(options.to) ? options.to : [options.to]).map(
      (email) => ({ email })
    )

    const payload = {
      sender: {
        name: env.SITE_NAME || '一梦五千年',
        email: env.BREVO_SENDER_EMAIL || env.BREVO_SMTP_USER,
      },
      to: toList,
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text,
      attachment: buildAttachments(options.attachments),
    }

    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Brevo API 返回错误 (${res.status}): ${errBody}`)
    }

    const data = (await res.json()) as { messageId?: string }
    const messageId = data.messageId || ''

    console.log('邮件发送成功:', messageId)
    return {
      success: true,
      messageId,
      response: 'OK',
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
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #ff0000;
            background: #fff0f0;
            padding: 12px 20px;
            border-radius: 8px;
          ">
            ${code}
          </span>
        </div>
        
        <p style="color: #333; font-weight: bold; line-height: 1.6;">
          验证码有效期 <strong style="color: #ff0000;">5</strong> 分钟，请尽快使用。
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
