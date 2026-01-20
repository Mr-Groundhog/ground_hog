import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(50, "分类名称不能超过50个字符"),
  slug: z.string().min(1, "分类路径不能为空").regex(/^[a-z0-9-]+$/, "路径只能包含小写字母、数字和连字符"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
