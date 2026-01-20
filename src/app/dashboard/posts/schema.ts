import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  slug: z.string().min(1, "URL 路径不能为空").regex(/^[a-z0-9-]+$/, "路径只能包含小写字母、数字和连字符"),
  content: z.string().min(1, "内容不能为空"),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
});

export type PostFormValues = z.infer<typeof postSchema>;
