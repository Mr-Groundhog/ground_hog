"use client";

import { useState } from "react";
import { Link as LinkIcon, MapPin, Quote, User, Image as ImageIcon } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { applyFriendLink } from "../actions";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

import { useLoadingStore } from "@/store/loading-store";

const applySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().optional(),
  logo: z.string().optional().or(z.literal("")),
  email: z.string().email("请输入有效的邮箱").optional().or(z.literal("")),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export function FriendLinkFab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      logo: "",
      email: "",
    },
  });

  async function onSubmit(data: ApplyFormValues) {
    startLoading();
    try {
      await applyFriendLink(data);
      toast.success("申请已提交，请等待审核");
      setDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error("提交失败");
    } finally {
      stopLoading();
    }
  }

  return (
    <>
      {/* 右下角悬浮按钮 - 点击直接打开申请表单 */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 rounded-full h-14 w-14 md:h-16 md:w-16 shadow-xl bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer"
        onClick={() => setDialogOpen(true)}
      >
        <LinkIcon className="h-7 w-7 md:h-8 md:w-8" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[780px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px]">
            {/* 左侧 - 申请表单区域 */}
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-cyan-500" />
                  申请友链
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      填写您的网站信息，审核通过后将在友链页面展示。
                    </p>
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2">
                      <span className="text-base shrink-0">🤝</span>
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        提交后请把博主的链接也添加到贵站哟😜！
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-900 dark:text-zinc-50">网站名称</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：Ferry's Blog" {...field} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400" />
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
                        <FormLabel className="text-zinc-900 dark:text-zinc-50">网站地址</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400" />
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
                            <FormLabel className="text-zinc-900 dark:text-zinc-50">Logo</FormLabel>
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
                            <FormLabel className="text-zinc-900 dark:text-zinc-50">签名</FormLabel>
                            <FormControl>
                              <Textarea placeholder="简短介绍您的网站..." {...field} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400" />
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
                        <FormLabel className="text-zinc-900 dark:text-zinc-50">联系邮箱 (用于通知)</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      取消
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      提交申请
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>

            {/* 右侧 - 站长信息卡片 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-5">站长信息</h3>

              {/* 头像 + 昵称 */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-cyan-500/30 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-lg">
                    <img
                      src="https://img2.leileihog.top/images/a7b3ebd302c432d8aaad116f7e2b3574.png"
                      alt="一梦五千年"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">一梦五千年</h4>
              </div>

              {/* 友链信息 */}
              <div className="space-y-3 mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">添加友链时请使用以下信息</h4>

                <div className="space-y-2.5">
                  {/* 昵称 */}
                  <div className="flex items-start gap-2">
                    <User className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">昵称</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">一梦五千年</p>
                    </div>
                  </div>
                  {/* 签名 */}
                  <div className="flex items-start gap-2">
                    <Quote className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">签名</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">鹿踏雾而来，鲸随浪而起</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">地址</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all">https://hog.leileihog.top</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">头像</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all">https://img2.leileihog.top/images/a7b3ebd302c432d8aaad116f7e2b3574.png</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
