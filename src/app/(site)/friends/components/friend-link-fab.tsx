"use client";

import { useState } from "react";
import { Plus, MessageCircle, Link as LinkIcon } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
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
  const [open, setOpen] = useState(false); // Controls FAB expansion
  const [dialogOpen, setDialogOpen] = useState(false); // Controls Apply Dialog
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
      <div 
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-3 md:gap-4"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-3 md:gap-4 items-end mb-2 md:mb-0"
            >
              {/* WeChat Button with QR Popover */}
              <div className="relative group flex items-center gap-2">
                 <div className="absolute right-full mr-2 w-32 h-32 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-zinc-200 dark:border-zinc-700">
                    {/* Placeholder QR Code */}
                    <div className="w-full h-full bg-black/10 flex items-center justify-center text-xs text-center text-zinc-500">
                       微信二维码
                    </div>
                 </div>
                 <Button size="icon" className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-green-500 hover:bg-green-600 text-white shadow-lg cursor-pointer">
                    <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                 </Button>
              </div>

              {/* Apply Link Button */}
              <Button 
                size="icon" 
                className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg cursor-pointer"
                onClick={() => setDialogOpen(true)}
              >
                <LinkIcon className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <Button 
          size="icon" 
          className={`rounded-full h-14 w-14 md:h-16 md:w-16 shadow-xl transition-transform duration-300 bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer ${open ? 'rotate-45' : ''}`}
        >
          <Plus className="h-7 w-7 md:h-8 md:w-8" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50">申请友链</DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              提交您的网站信息，审核通过后将展示在友链页面。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <FormLabel className="text-zinc-900 dark:text-zinc-50">描述 (申请理由)</FormLabel>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
