"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fingerprint,
  User,
  Lock,
  Mail,
  LayoutDashboard,
  Send,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserStore } from "@/store/user-store";
import { useLoadingStore } from "@/store/loading-store";
import { resolveRedirect } from "@/app/(auth)/safe-redirect";

const loginSchema = z.object({
  username: z.string().min(1, "请输入账号"),
  password: z.string().min(6, "密码至少 6 位"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// 邮箱验证码登录 Schema
const emailLoginSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
  code: z.string().min(6, "验证码至少 6 位"),
});

type EmailLoginFormValues = z.infer<typeof emailLoginSchema>;

export function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("from");
  const redirectTo = useMemo(
    () => resolveRedirect(redirectParam),
    [redirectParam],
  );

  const login = useUserStore((state) => state.login);
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const [errorMsg, setErrorMsg] = useState("");

  // 邮箱登录相关状态
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState("");

  // 新用户注册成功弹窗状态
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState<{
    username: string;
    password: string;
    email: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 账号密码表单
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 邮箱验证码表单
  const emailForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const {
    register: emailRegister,
    handleSubmit: emailHandleSubmit,
    formState: { errors: emailErrors },
  } = emailForm;

  // 发送验证码
  const handleSendCode = async (email: string) => {
    if (countdown > 0) return;
    
    setSendCodeLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      
      if (res.ok && result.code === 200) {
        setSendSuccess(true);
        setSendSuccessMsg(result.message || "验证码已发送");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setEmailErrorMsg(result.message || "发送失败");
      }
    } catch (err) {
      setEmailErrorMsg("网络错误，请稍后重试");
    } finally {
      setSendCodeLoading(false);
    }
  };

  // 邮箱验证码登录提交
  const onEmailSubmit = async (data: EmailLoginFormValues) => {
    setEmailLoading(true);
    setEmailErrorMsg("");

    try {
      const res = await fetch("/api/auth/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.code === 200) {
        const { user, token, isNewUser, tempPassword } = result.data;
        login(user, token);

        // 新用户显示账号密码弹窗
        if (isNewUser && tempPassword) {
          setNewUserInfo({
            username: user.username,
            password: tempPassword,
            email: user.email,
          });
          setShowSuccessDialog(true);
        } else {
          router.replace(redirectTo || "/");
        }
      } else {
        setEmailErrorMsg(result.message || "登录失败");
      }
    } catch (err) {
      setEmailErrorMsg("网络错误，请稍后重试");
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("复制失败", err);
    }
  };

  // 关闭并跳转到首页
  const handleCloseAndGoHome = () => {
    setShowSuccessDialog(false);
    router.push("/");
  };

  const onSubmit = async (data: LoginFormValues) => {
    startLoading();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.code === 200) {
        const { user, token } = result.data;
        login(user, token);
        router.replace(redirectTo || "/");
      } else {
        setErrorMsg(result.message || "登录失败");
      }
    } catch (err) {
      setErrorMsg("网络错误，请稍后重试");
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  const registerUrl = "/register";

  return (
    <div className="flex flex-col items-center">
      <div className="w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <Fingerprint className="h-12 w-12 text-cyan-500 mb-4" />
          <h1 className="text-2xl font-bold">访问终端</h1>
          <p className="text-sm text-muted-foreground mt-2">
            登录后可解锁更多功能
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">账号登录</TabsTrigger>
            <TabsTrigger value="email">邮箱登录</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-4 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>身份标识</Label>
                <Input {...register("username")} placeholder="请输入账号或邮箱" />
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>访问口令</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    找回密码
                  </Link>
                </div>
                <Input type="password" {...register("password")} placeholder="请输入密码" />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {errorMsg && (
                <p className="text-center text-xs text-red-500">{errorMsg}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "验证中..." : "验证并进入"}
                </Button>
                <Link href="/admin/login">
                  <Button type="button" variant="outline" title="前往后台">
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="email" className="mt-4 space-y-4">
            <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              邮箱登录则视为自动注册，新用户将自动创建账号
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label>邮箱地址</Label>
                <div className="flex gap-2">
                  <Input {...emailRegister("email")} type="email" placeholder="请输入邮箱" />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={sendCodeLoading || countdown > 0}
                    onClick={async () => {
                      const isValid = await emailForm.trigger("email");
                      if (isValid) {
                        handleSendCode(emailForm.getValues("email"));
                      }
                    }}
                  >
                    {sendCodeLoading ? "..." : countdown > 0 ? `${countdown}s` : sendSuccess ? "已发送" : "获取验证码"}
                  </Button>
                </div>
                {emailErrors.email && (
                  <p className="text-xs text-red-500">{emailErrors.email.message}</p>
                )}
                {sendSuccessMsg && (
                  <p className="text-xs text-green-500">{sendSuccessMsg}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>验证码</Label>
                <Input {...emailRegister("code")} placeholder="请输入 6 位验证码" maxLength={6} />
                {emailErrors.code && (
                  <p className="text-xs text-red-500">{emailErrors.code.message}</p>
                )}
              </div>

              {emailErrorMsg && (
                <p className="text-center text-xs text-red-500">{emailErrorMsg}</p>
              )}

              <Button
                type="button"
                disabled={emailLoading}
                onClick={emailHandleSubmit(onEmailSubmit)}
                className="w-full"
              >
                {emailLoading ? "验证中..." : "验证并进入"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          还没有账号?{" "}
          <button
            type="button"
            onClick={() => {
              router.back();
              setTimeout(() => router.push("/register"), 0);
            }}
            className="text-primary hover:underline"
          >
            立即注册
          </button>
        </p>
      </div>

      {/* 新用户注册成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={(open) => !open && setShowSuccessDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <DialogTitle>注册成功</DialogTitle>
                <DialogDescription>请妥善保存您的账号信息</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
            您的账号已自动创建，<strong>密码为一次性密码</strong>，登录后建议前往个人中心修改密码。
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">账号</Label>
              <div className="flex gap-2">
                <Input value={newUserInfo?.username || ""} readOnly />
                <Button size="icon" variant="outline" onClick={() => newUserInfo && handleCopy(newUserInfo.username, "username")}>
                  {copiedField === "username" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">密码</Label>
              <div className="flex gap-2">
                <Input value={newUserInfo?.password || ""} readOnly className="font-mono" />
                <Button size="icon" variant="outline" onClick={() => newUserInfo && handleCopy(newUserInfo.password, "password")}>
                  {copiedField === "password" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">邮箱</Label>
              <div className="flex gap-2">
                <Input value={newUserInfo?.email || ""} readOnly />
                <Button size="icon" variant="outline" onClick={() => newUserInfo && handleCopy(newUserInfo.email, "email")}>
                  {copiedField === "email" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => newUserInfo && handleCopy(`${newUserInfo.username} / ${newUserInfo.password}`, "all")}>
              {copiedField === "all" ? "已复制" : "复制全部"}
            </Button>
            <Button className="flex-1" onClick={handleCloseAndGoHome}>我已保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
