'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function MailTestPage() {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: subject || '测试邮件',
          html: `<div><h2>测试邮件</h2><p>${content || '这是一封测试邮件'}</p></div>`,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('邮件发送成功！')
      } else {
        toast.error(`发送失败: ${result.message}`)
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
      console.error('发送错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendVerificationCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send/verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: '123456',
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('验证码邮件发送成功！')
      } else {
        toast.error(`发送失败: ${result.message}`)
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
      console.error('发送错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          title: '系统通知',
          content: '这是一条来自 Ground Hog 的系统通知消息。\n\n祝您使用愉快！',
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('通知邮件发送成功！')
      } else {
        toast.error(`发送失败: ${result.message}`)
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
      console.error('发送错误:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>📧 邮件发送测试</CardTitle>
          <CardDescription>
            测试 Gmail 邮件发送功能，支持普通邮件、验证码和通知邮件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">收件人邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入测试邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">邮件主题（普通邮件）</Label>
            <Input
              id="subject"
              placeholder="邮件主题"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">邮件内容（普通邮件）</Label>
            <Textarea
              id="content"
              placeholder="邮件内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={sendTestEmail} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '发送中...' : '📤 发送普通邮件'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={sendVerificationCode} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '发送中...' : '🔢 发送验证码'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendNotification} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '发送中...' : '🔔 发送通知'}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">💡 使用说明：</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>请先在 <code className="bg-background px-1 rounded">.env</code> 文件中配置 Gmail 凭据</li>
              <li>确保已获取 Gmail 应用专用密码</li>
              <li>输入有效的测试邮箱地址</li>
              <li>点击对应按钮发送不同类型的测试邮件</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}