
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCheck, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 密码复杂度校验函数
const validatePasswordComplexity = (password: string) => {
  let count = 0;
  if (/[A-Z]/.test(password)) count++;
  if (/[a-z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[^A-Za-z0-9]/.test(password)) count++;
  return count >= 3;
};

const registerSchema = z.object({
  username: z.string().min(2, "用户名至少需要2个字符"),
  email: z.string().email("请输入有效的电子邮箱"),
  password: z.string().min(8, "密码长度至少8位").refine(validatePasswordComplexity, "密码必须包含大写字母、小写字母、数字、特殊符号中的至少三种"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

import { useLoadingStore } from "@/store/loading-store";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: RegisterFormValues) => {
    startLoading();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password
        }),
      });

      const result = await res.json();

      if (res.ok && result.code === 201) { // 201 Created
        // Register success
        router.push("/login"); 
      } else {
        setErrorMsg(result.message || "注册失败");
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
            <UserCheck className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">创建数字身份</h1>
          <p className="mt-2 font-mono text-xs text-cyan-500/70">INITIALIZING IDENTITY PROTOCOL_</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>用户名</span>
              <span className="font-mono">UID_ALLOC: AUTO</span>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                {...register("username")}
                placeholder="键入身份标识" 
                className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" 
              />
            </div>
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">电子邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                {...register("email")}
                placeholder="mail@neural.link" 
                className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" 
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs text-zinc-500">设置密码</label>
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
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">确认密码</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  type="password" 
                  {...register("confirmPassword")}
                  placeholder="••••••••" 
                  className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" 
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}

          <Button type="submit" disabled={isLoading} className="mt-6 w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {isLoading ? "注册中..." : "确认注册"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          已有账号? <Link href="/login" className="text-cyan-400 hover:underline">立即登录</Link>
        </div>
      </div>
    </motion.div>
  );
}
