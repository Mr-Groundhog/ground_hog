/**
 * 邮件发送测试脚本
 * 使用方法: npx tsx scripts/test-mailer.ts
 */

import { sendMail, sendVerificationCode, sendNotification } from '../src/lib/mailer'

async function testMailer() {
  console.log('开始测试邮件发送功能...\n')

  try {
    // 测试 1: 发送普通邮件
    console.log('1. 测试发送普通邮件...')
    const result1 = await sendMail({
      to: 'test@example.com', // 请替换为实际的测试邮箱
      subject: '测试邮件 - 一梦五千年',
      html: '<h1>Hello World!</h1><p>这是一封测试邮件。</p>',
    })
    console.log('✅ 普通邮件发送成功:', result1.messageId)

    // 测试 2: 发送验证码邮件
    console.log('\n2. 测试发送验证码邮件...')
    const result2 = await sendVerificationCode(
      'test@example.com', // 请替换为实际的测试邮箱
      '123456'
    )
    console.log('✅ 验证码邮件发送成功:', result2.messageId)

    // 测试 3: 发送通知邮件
    console.log('\n3. 测试发送通知邮件...')
    const result3 = await sendNotification(
      'test@example.com', // 请替换为实际的测试邮箱
      '系统通知',
      '这是一条系统通知消息。\n\n祝您使用愉快！'
    )
    console.log('✅ 通知邮件发送成功:', result3.messageId)

    console.log('\n🎉 所有测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testMailer()
}

export default testMailer