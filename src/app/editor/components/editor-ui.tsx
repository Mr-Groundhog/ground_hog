"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Settings, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPost, updatePost } from "@/app/dashboard/posts/actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  slug: z.string().optional(),
  content: z.string().min(1, "内容不能为空"),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface EditorUIProps {
  categories: { id: string; name: string }[];
  currentUserId: string;
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary?: string | null;
    coverImage?: string | null;
    categoryId?: string | null;
    published: boolean;
  };
}

import { useLoadingStore } from "@/store/loading-store";

export function EditorUI({ initialData, currentUserId, categories }: EditorUIProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isEdit = !!initialData;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      summary: initialData?.summary || "",
      coverImage: initialData?.coverImage || "",
      categoryId: initialData?.categoryId || "",
      published: initialData?.published ?? false,
    },
  });

  const { register, handleSubmit, setValue, watch } = form;
  const content = watch("content");

  const onSubmit = async (data: PostFormValues) => {
    if (!currentUserId) {
      toast.error("用户未登录");
      return;
    }

    startLoading();
    setIsSubmitting(true);
    try {
      // 如果没有 slug，自动生成
      const finalData = {
        ...data,
        slug: data.slug || `post-${Date.now()}`,
      };

      if (isEdit && initialData) {
        await updatePost(initialData.id, finalData);
        toast.success("文章已更新");
      } else {
        await createPost(finalData, currentUserId);
        toast.success(data.published ? "文章已发布" : "草稿已保存");
      }
      
      router.push("/dashboard/posts");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "操作失败");
      } else {
        toast.error("操作失败");
      }
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  const handlePublish = () => {
    setValue("published", true);
    // 触发表单提交，如果校验通过则调用 onSubmit
    // 这里需要手动触发 submit，因为按钮在 form 外部或者作为 trigger
    // 最简单的方式是把按钮放在 form 内部，或者使用 handleSubmit(onSubmit)()
    form.handleSubmit(onSubmit)();
  };

  const handleSaveDraft = () => {
    setValue("published", false);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-background px-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Input
            {...register("title")}
            placeholder="请输入文章标题..."
            className="h-10 flex-1 border-none bg-transparent text-xl font-bold focus-visible:ring-0 md:text-2xl"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
           {content.length > 0 && <span>{content.length} 字</span>}
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full" data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(val) => setValue("content", val || "")}
            height="100%"
            visibleDragbar={false}
            preview="live"
            enableScroll={true}
            textareaProps={{
              placeholder: "开始创作...",
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex h-16 items-center justify-between border-t border-zinc-800 bg-background px-6">
        <div className="flex items-center gap-4">
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                发文设置
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[640px] sm:max-w-none">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>发文设置</SheetTitle>
                <SheetDescription>
                  配置文章的封面、分类、摘要等信息。
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 px-6 py-4">
                <div className="grid gap-2">
                  <Label>文章分类</Label>
                  <Select
                    onValueChange={(val) => setValue("categoryId", val)}
                    defaultValue={watch("categoryId")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>封面图片 URL</Label>
                  <div className="flex gap-2">
                     <Input
                      {...register("coverImage")}
                      placeholder="https://..."
                    />
                  </div>
                  {watch("coverImage") && (
                     <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={watch("coverImage")} 
                          alt="Cover" 
                          className="object-cover w-full h-full"
                        />
                     </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>URL 路径 (Slug)</Label>
                  <Input
                    {...register("slug")}
                    placeholder="post-slug-url (留空自动生成)"
                  />
                  <p className="text-xs text-zinc-500">
                    唯一标识符，用于文章链接。
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>摘要</Label>
                  <Textarea
                    {...register("summary")}
                    placeholder="文章简短介绍..."
                    className="h-24"
                  />
                </div>
              </div>
              <SheetFooter className="px-6 pb-6">
                <SheetClose asChild>
                  <Button type="button">确认</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
             <Save className="mr-2 h-4 w-4" />
             保存草稿
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            发布博客
          </Button>
        </div>
      </footer>
    </div>
  );
}
