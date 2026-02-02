import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendNotification } from '@/lib/mailer'

// 通知邮件请求体验证
const NotificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  title: z.string().min(1, '通知标题不能为空'),
  content: z.string().min(1, '通知内容不能为空'),
})

export async function POST(request: NextRequest) {
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