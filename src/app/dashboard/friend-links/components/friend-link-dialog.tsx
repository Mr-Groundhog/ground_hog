"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { friendLinkSchema, FriendLinkFormValues } from "../schema";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFriendLink, updateFriendLink } from "../actions";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

interface FriendLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendLink?: any;
}

import { useLoadingStore } from "@/store/loading-store";

export function FriendLinkDialog({ open, onOpenChange, friendLink }: FriendLinkDialogProps) {
  const { startLoading, stopLoading } = useLoadingStore();
  const isEdit = !!friendLink;
  
  const form = useForm<FriendLinkFormValues>({
    resolver: zodResolver(friendLinkSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      logo: "",
      email: "",
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (friendLink) {
      form.reset({
        name: friendLink.name,
        url: friendLink.url,
        description: friendLink.description || "",
        logo: friendLink.logo || "",
        email: friendLink.email || "",
        status: friendLink.status,
      });
    } else {
      form.reset({
        name: "",
        url: "",
        description: "",
        logo: "",
        email: "",
        status: "APPROVED",
      });
    }
  }, [friendLink, form, open]);

  async function onSubmit(data: FriendLinkFormValues) {
    startLoading();
    try {
      if (isEdit) {
        await updateFriendLink(friendLink.id, data);
        toast.success("友链更新成功");
      } else {
        await createFriendLink(data);
        toast.success("友链创建成功");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑友链" : "新增友链"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改友链信息" : "添加一个新的友情链接"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：Ferry's Blog" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>链接地址</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          folder="friends"
                          placeholder="Logo"
                          maxSize={2}
                          compact
                          className="h-20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="简短描述..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">待审核</SelectItem>
                      <SelectItem value="APPROVED">已通过</SelectItem>
                      <SelectItem value="REJECTED">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
