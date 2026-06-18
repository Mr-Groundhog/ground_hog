"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createUser, updateUser } from "../actions";
import { toast } from "sonner";

interface DialogUser {
  id: string;
  username: string;
  email: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  bio: string | null;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: DialogUser;
  mode: "create" | "edit" | "view";
}

import { useLoadingStore } from "@/store/loading-store";

export function UserDialog({
  user,
  open,
  onOpenChange,
  mode = "view",
}: UserDialogProps) {
  const { startLoading, stopLoading } = useLoadingStore();
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const title = mode === "create" ? "新增用户" : mode === "edit" ? "编辑用户" : "用户详情";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      nickname: "",
      role: "USER",
      isActive: true,
      bio: "",
    },
  });

  useEffect(() => {
    if (user && mode !== "create") {
      form.reset({
        username: user.username,
        email: user.email,
        nickname: user.nickname || "",
        role: user.role,
        isActive: user.isActive,
        bio: user.bio || "",
      });
    } else {
      form.reset({
        username: "",
        email: "",
        nickname: "",
        role: "USER",
        isActive: true,
        bio: "",
      });
    }
  }, [user, mode, form, open]);

  async function onSubmit(data: UserFormValues) {
    if (isView) return;
    startLoading();
    try {
      if (mode === "create") {
        await createUser(data);
        toast.success("用户创建成功");
      } else if (mode === "edit" && user) {
        await updateUser(user.id, data);
        toast.success("用户更新成功");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "操作失败");
      } else {
        toast.error("操作失败");
      }
    } finally {
      stopLoading();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isView ? "查看用户详细信息" : "请填写以下信息"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} disabled={isView || isEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isView}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">普通用户</SelectItem>
                      <SelectItem value="ADMIN">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>状态</FormLabel>
                    <FormDescription>
                      {field.value ? "正常" : "冻结"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isView}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>简介</FormLabel>
                  <FormControl>
                    <Textarea placeholder="" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {!isView && (
                <>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    保存
                  </Button>
                </>
              )}
              {isView && (
                <Button type="button" onClick={() => onOpenChange(false)}>
                  关闭
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
