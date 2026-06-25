"use client";

import { useState, lazy, Suspense } from "react";
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
import { applyPromptTemplate } from "../actions";
import { toast } from "sonner";
import { PROMPT_CATEGORIES } from "@/config/prompt-categories";
import { useLoadingStore } from "@/store/loading-store";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

const applySchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题最多100字"),
  content: z.string().min(1, "提示词内容不能为空").max(10000, "提示词内容最多10000字"),
  category: z.string().min(1, "分类不能为空"),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export function PromptTemplateFab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      // 确保关闭弹窗后恢复 body 滚动
      requestAnimationFrame(() => {
        document.body.style.overflow = "";
      });
    }
  }

  async function onSubmit(data: ApplyFormValues) {
    startLoading();
    try {
      await applyPromptTemplate(data);
      toast.success("模板已提交，等待审核");
      handleOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "提交失败");
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

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] bg-zinc-950 text-zinc-50 border-zinc-800 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">提交提示词模板</DialogTitle>
            <DialogDescription className="text-zinc-400">
              分享你的提示词，审核通过后将展示在平台。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">分类</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-50 h-10">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                        {PROMPT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="focus:bg-zinc-800 focus:text-zinc-50">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">标题</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：代码审查助手" {...field} maxLength={100} className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 h-10" />
                    </FormControl>
                    <div className="text-xs text-zinc-600 text-right">{field.value?.length || 0}/100</div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-50">提示词内容 <span className="text-xs text-zinc-500">（支持 Markdown）</span></FormLabel>
                    <FormControl>
                      <div data-color-mode="dark">
                        <Suspense fallback={<div className="h-48 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />}>
                          <MDEditor
                            value={field.value}
                            onChange={(val) => field.onChange(val || "")}
                            height={220}
                            preview="edit"
                            visibleDragbar={false}
                            className="border-zinc-800"
                          />
                        </Suspense>
                      </div>
                    </FormControl>
                    <div className="text-xs text-zinc-600 text-right">{field.value?.length || 0}/10000</div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              </div>
              <DialogFooter className="flex-shrink-0 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
                  取消
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white min-w-[100px]">
                  {form.formState.isSubmitting ? "提交中..." : "提交审核"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
