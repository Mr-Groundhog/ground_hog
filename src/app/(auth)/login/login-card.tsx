"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fingerprint,
  User,
  Lock,
  Smartphone,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUserStore } from "@/store/user-store";
import { useLoadingStore } from "@/store/loading-store";
import { resolveRedirect } from "@/app/(auth)/safe-redirect";

const loginSchema = z.object({
  username: z.string().min(1, "请输入账号"),
  password: z.string().min(6, "密码至少 6 位"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

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

  const registerUrl = redirectTo
    ? `/register?from=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="w-full rounded-xl border border-cyan-500/20 bg-[#0A0A0A] p-8 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] backdrop-blur-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Fingerprint className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            访问终端
          </h1>
          <p className="mt-2 font-mono text-xs text-cyan-500/70">
            登录后可解锁更多功能
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-zinc-900/50">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-cyan-950/30 data-[state=active]:text-cyan-400"
            >
              账号登录
            </TabsTrigger>
            <TabsTrigger
              value="mobile"
              className="data-[state=active]:bg-cyan-950/30 data-[state=active]:text-cyan-400"
            >
              手机号登录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>身份标识</span>
                  <span className="font-mono">识别码 001</span>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    {...register("username")}
                    placeholder="请输入账号或邮箱"
                    className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">访问口令</span>
                  <Link
                    href="#"
                    className="text-pink-500 hover:text-pink-400"
                  >
                    找回密码
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="请输入密码"
                    className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errorMsg && (
                <p className="text-center text-xs text-red-500">{errorMsg}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-cyan-500 font-bold tracking-wide text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400"
                >
                  {isLoading ? "验证中..." : "验证并进入"}
                </Button>

                <Link href="/admin/login" className="contents">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-12 border-zinc-800 bg-zinc-900/50 px-0 hover:bg-zinc-800 hover:text-cyan-400"
                    title="前往后台"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="mobile">
            <form className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>手机号</span>
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="暂未开放"
                    disabled
                    className="cursor-not-allowed border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                  />
                </div>
              </div>
              <Button
                disabled
                className="mt-6 w-full cursor-not-allowed bg-cyan-500/50 font-bold tracking-wide text-black"
              >
                敬请期待
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-xs text-zinc-500">
          还没有账号?{" "}
          <Link href={registerUrl} className="text-cyan-400 hover:underline">
            立即注册
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
