"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { applyAiTool } from "../actions";
import { toast } from "sonner";

const applySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().min(1, "描述不能为空"),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

const CATEGORIES = ["对话聊天", "图像生成", "编程辅助", "音频处理", "视频制作", "办公效率", "设计工具", "其他"];

import { useLoadingStore } from "@/store/loading-store";

export function AiApplyFab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      icon: "",
      coverImage: "",
      category: "",
      tags: "",
    },
  });

  async function onSubmit(data: ApplyFormValues) {
    startLoading();
    try {
      await applyAiTool(data);
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
      <div className="fixed bottom-10 right-10 z-50">
        <Button 
          size="icon" 
          className="rounded-full h-14 w-14 shadow-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-transform hover:scale-105 hover:rotate-90"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-zinc-950 text-zinc-50 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">提交 AI 工具</DialogTitle>
            <DialogDescription className="text-zinc-400">
              分享您发现的优质 AI 工具，审核通过后将展示在平台。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-50">工具名称</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：ChatGPT" {...field} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-50">分类</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-50">
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="focus:bg-zinc-800 focus:text-zinc-50">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">链接地址</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="简短介绍该工具的功能与特色..." {...field} className="h-24 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-50">Icon URL (可选)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-50">封面图 URL (可选)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">标签 (逗号分隔)</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：GPT-4,开源,生产力" {...field} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
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
