import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMail, sendVerificationCode, sendNotification } from '@/lib/mailer'

// 邮件发送请求体验证
const SendMailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, '邮件主题不能为空'),
  html: z.string().optional(),
  text: z.string().optional(),
})

// 验证码邮件请求体验证
const VerificationCodeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须是6位数字'),
})

// 通知邮件请求体验证
const NotificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  title: z.string().min(1, '通知标题不能为空'),
  content: z.string().min(1, '通知内容不能为空'),
})

// GET 请求 - 测试邮件功能
export async function GET() {
  return NextResponse.json({
    message: '邮件发送 API',
    endpoints: {
      POST: '/api/send - 发送普通邮件',
      '/verification-code': 'POST /api/send/verification-code - 发送验证码',
      '/notification': 'POST /api/send/notification - 发送通知邮件',
    },
  })
}

// POST 请求 - 发送普通邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text } = SendMailSchema.parse(body)

    const result = await sendMail({ to, subject, html, text })
    
    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      data: result,
    })

  } catch (error) {
    console.error('邮件发送错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '参数验证失败',
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '邮件发送失败',
      },
      { status: 500 }
    )
  }
}

// 发送验证码邮件的路由处理器
export async function POST_VERIFICATION_CODE(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = VerificationCodeSchema.parse(body)

    const result = await sendVerificationCode(email, code)
    
    return NextResponse.json({
      success: true,
      message: '验证码邮件发送成功',
      data: result,
    })

  } catch (error) {
    console.error('验证码邮件发送错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '参数验证失败',
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '验证码邮件发送失败',
      },
      { status: 500 }
    )
  }
}

// 发送通知邮件的路由处理器
export async function POST_NOTIFICATION(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, title, content } = NotificationSchema.parse(body)

    const result = await sendNotification(email, title, content)
    
    return NextResponse.json({
      success: true,
      message: '通知邮件发送成功',
      data: result,
    })

  } catch (error) {
    console.error('通知邮件发送错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '参数验证失败',
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '通知邮件发送失败',
      },
      { status: 500 }
    )
  }
}