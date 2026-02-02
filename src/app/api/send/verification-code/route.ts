import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendVerificationCode } from '@/lib/mailer'

// 验证码邮件请求体验证
const VerificationCodeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须是6位数字'),
})

export async function POST(request: NextRequest) {
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