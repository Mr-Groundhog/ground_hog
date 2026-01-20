
"use client";

import { useRouter } from "next/navigation";
import { Shield, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/user-store";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "请输入管理员账号"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

import { useLoadingStore } from "@/store/loading-store";

export default function AdminLoginPage() {
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
        body: JSON.stringify({ ...data, adminLogin: true }),
      });

      const result = await res.json();

      if (res.ok && result.code === 200) {
        const { user, token } = result.data;
        login(user, token);
        router.push("/dashboard"); 
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen items-center justify-center bg-black"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">后台管理系统</h1>
          <p className="mt-2 text-sm text-zinc-400">请使用管理员账号登录</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">账号</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                {...register("username")}
                className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                placeholder="Admin ID"
              />
            </div>
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
             <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-300">密码</label>
             </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                type="password" 
                {...register("password")}
                className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                placeholder="••••••••"
              />
            </div>
             {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="mt-2 rounded-md border border-amber-400 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 text-center shadow-[0_0_18px_rgba(251,191,36,0.45)]">
              {errorMsg}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="mt-6 w-full bg-white text-black hover:bg-zinc-200 font-medium"
          >
            {isLoading ? "登录中..." : "进入后台"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
