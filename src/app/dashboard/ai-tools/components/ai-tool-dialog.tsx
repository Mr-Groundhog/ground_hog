"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aiToolSchema, AiToolFormValues } from "../schema";
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
import { createAiTool, updateAiTool } from "../actions";
import { toast } from "sonner";

interface AiToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiTool?: any;
}

const CATEGORIES = ["对话聊天", "图像生成", "编程辅助", "音频处理", "视频制作", "办公效率", "设计工具", "其他"];

import { useLoadingStore } from "@/store/loading-store";

export function AiToolDialog({ open, onOpenChange, aiTool }: AiToolDialogProps) {
  const isEdit = !!aiTool;
  const { startLoading, stopLoading } = useLoadingStore();
  
  const form = useForm<AiToolFormValues>({
    resolver: zodResolver(aiToolSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      icon: "",
      coverImage: "",
      category: "",
      tags: "",
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (aiTool) {
      form.reset({
        name: aiTool.name,
        url: aiTool.url,
        description: aiTool.description,
        icon: aiTool.icon || "",
        coverImage: aiTool.coverImage || "",
        category: aiTool.category,
        tags: aiTool.tags || "",
        status: aiTool.status,
      });
    } else {
      form.reset({
        name: "",
        url: "",
        description: "",
        icon: "",
        coverImage: "",
        category: "",
        tags: "",
        status: "APPROVED",
      });
    }
  }, [aiTool, form, open]);

  async function onSubmit(data: AiToolFormValues) {
    startLoading();
    try {
      if (isEdit) {
        await updateAiTool(aiTool.id, data);
        toast.success("更新成功");
      } else {
        await createAiTool(data);
        toast.success("创建成功");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑 AI 工具" : "新增 AI 工具"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改工具信息" : "添加一个新的 AI 工具"}
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
                    <FormLabel>工具名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：ChatGPT" {...field} />
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
                    <FormLabel>分类</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                  <FormLabel>链接地址</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="工具简介..." {...field} className="h-24" />
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
                    <FormLabel>Icon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                    <FormLabel>封面图 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                  <FormLabel>标签 (逗号分隔)</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：GPT-4,开源,生产力" {...field} />
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
