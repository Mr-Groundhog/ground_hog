
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, User, Lock, Smartphone, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/user-store";
import { useLoadingStore } from "@/store/loading-store";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "请输入账号"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
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

  const { register, handleSubmit, formState: { errors } } = form;

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
        // Login success
        const { user, token } = result.data;
        login(user, token);
        router.push("/"); // Redirect to home or wherever
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      {/* Card Container */}
      <div className="w-full rounded-xl border border-cyan-500/20 bg-[#0A0A0A] p-8 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Fingerprint className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">访问终端</h1>
          <p className="mt-2 font-mono text-xs text-cyan-500/70">等待凭证验证_</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-zinc-900/50">
            <TabsTrigger value="account" className="data-[state=active]:bg-cyan-950/30 data-[state=active]:text-cyan-400">账号登录</TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-cyan-950/30 data-[state=active]:text-cyan-400">手机登录</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>身份标识</span>
                  <span className="font-mono">识别码: 001</span>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    {...register("username")}
                    placeholder="请输入账号/邮箱" 
                    className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" 
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">密钥密码</span>
                  <Link href="#" className="text-pink-500 hover:text-pink-400">找回密码</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    type="password" 
                    {...register("password")}
                    placeholder="••••••••" 
                    className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" 
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  {isLoading ? "验证中..." : "验证并进入"}
                </Button>
                
                <Link href="/admin/login" className="contents">
                    <Button 
                        type="button"
                        variant="outline"
                        className="w-12 px-0 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-cyan-400"
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
                  <span>手机号码</span>
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="请输入手机号" 
                    disabled
                    className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 cursor-not-allowed" 
                  />
                </div>
              </div>
              <Button disabled className="mt-6 w-full bg-cyan-500/50 text-black font-bold tracking-wide cursor-not-allowed">
                暂未开放
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          还没有身份? <Link href="/register" className="text-cyan-400 hover:underline">申请接入</Link>
        </div>
      </div>
    </motion.div>
  );
}
