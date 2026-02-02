'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLoadingStore } from '@/store/loading-store'

export default function TestFriendEmailPage() {
  const [email, setEmail] = useState('')
  const [siteName, setSiteName] = useState('')
  const [loading, setLoading] = useState(false)
  const { startLoading, stopLoading } = useLoadingStore()

  const sendTestEmail = async () => {
    if (!email || !siteName) {
      toast.error('请填写所有必填字段')
      return
    }

    startLoading()
    setLoading(true)
    try {
      const response = await fetch('/api/test-friend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          siteName,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('测试邮件发送成功！')
      } else {
        toast.error(`发送失败: ${result.message}`)
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
      console.error('发送错误:', error)
    } finally {
      stopLoading()
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>📧 友链审核邮件测试</CardTitle>
          <CardDescription>
            测试友链审核通过后的邮件发送功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">收件人邮箱 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入测试邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteName">网站名称 *</Label>
            <Input
              id="siteName"
              placeholder="请输入网站名称"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '发送中...' : '📤 发送测试邮件'}
          </Button>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">💡 使用说明：</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>此页面用于测试友链审核通过后的邮件发送功能</li>
              <li>邮件模板使用 contact-template.tsx 中定义的样式</li>
              <li>会自动记录到邮件日志中</li>
              <li>受IP限制规则约束（每小时最多3次）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}