"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useLoadingStore } from "@/store/loading-store"
import { Mail } from "lucide-react"

interface TestEmailDialogProps {
  children: React.ReactNode
}

export function TestEmailDialog({ children }: TestEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [siteName, setSiteName] = useState("")
  const [loading, setLoading] = useState(false)
  const { startLoading, stopLoading } = useLoadingStore()

  const handleTestEmail = async () => {
    if (!email || !siteName) {
      toast.error("请填写所有必填字段")
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    startLoading()
    setLoading(true)
    
    try {
      const response = await fetch("/api/test-friend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          siteName,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success("测试邮件发送成功！请检查邮箱。")
        // 关闭弹窗
        setOpen(false)
        // 清空表单
        setEmail("")
        setSiteName("")
      } else {
        toast.error(`发送失败: ${result.message}`)
      }
    } catch (error) {
      toast.error("网络错误，请稍后重试")
      console.error("发送错误:", error)
    } finally {
      stopLoading()
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            测试邮件服务
          </DialogTitle>
          <DialogDescription>
            发送测试邮件以验证邮件服务是否正常工作。将使用友链审核通过的邮件模板。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              收件人邮箱 *
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="siteName" className="text-right">
              网站名称 *
            </Label>
            <div className="col-span-3">
              <Input
                id="siteName"
                placeholder="我的网站"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">说明：</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>将使用友链审核通过的邮件模板</li>
              <li>受IP限制规则约束（每小时最多3次）</li>
              <li>邮件内容会包含你输入的网站名称</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            onClick={handleTestEmail} 
            disabled={loading || !email || !siteName}
          >
            {loading ? "发送中..." : "发送测试邮件"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}