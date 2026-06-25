import { z } from "zod";

export const promptTemplateSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  content: z.string().min(1, "提示词内容不能为空"),
  category: z.string().min(1, "分类不能为空"),
  tags: z.string().optional(),
});

export type PromptTemplateFormValues = z.infer<typeof promptTemplateSchema>;
