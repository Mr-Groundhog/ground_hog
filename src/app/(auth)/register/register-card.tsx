"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  UserCheck,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoadingStore } from "@/store/loading-store";

const validatePasswordComplexity = (password: string) => {
  let count = 0;
  if (/[A-Z]/.test(password)) count++;
  if (/[a-z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[^A-Za-z0-9]/.test(password)) count++;
  return count >= 3;
};

const registerSchema = z
  .object({
    username: z.string().min(2, "用户名至少需要 2 个字符"),
    email: z.string().email("请输入有效的电子邮箱"),
    password: z
      .string()
      .min(8, "密码长度至少 8 位")
      .refine(
        (value) => validatePasswordComplexity(value),
        "密码需包含大小写字母、数字、特殊符号中的至少三类",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterCard() {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

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
          password: data.password,
        }),
      });

      const result = await res.json();

      if (res.ok && result.code === 201) {
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
    <div className="flex flex-col items-center">
      <div className="w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <UserCheck className="h-12 w-12 text-cyan-500 mb-4" />
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-sm text-muted-foreground mt-2">
            填写以下信息完成注册
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input {...register("username")} placeholder="请输入用户名" />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input {...register("email")} type="email" placeholder="请输入邮箱" />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>密码</Label>
            <Input type="password" {...register("password")} placeholder="请输入密码" />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>确认密码</Label>
            <Input type="password" {...register("confirmPassword")} placeholder="请再次输入密码" />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {errorMsg && (
            <p className="text-center text-xs text-red-500">{errorMsg}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "注册中..." : "确认注册"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          已有账号?{" "}
          <button
            type="button"
            onClick={() => {
              router.back();
              setTimeout(() => router.push("/login"), 0);
            }}
            className="text-primary hover:underline"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
}
