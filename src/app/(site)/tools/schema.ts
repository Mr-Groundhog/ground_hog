import { z } from "zod";

export const submitToolSchema = z.object({
  name: z.string().min(2, "工具名称至少 2 个字符"),
  description: z.string().min(10, "描述至少 10 个字符"),
  url: z.string().url("请输入有效的 URL"),
  category: z.string().min(1, "请选择分类"),
  icon: z.string().optional(), // Lucide icon name
});

export type SubmitToolFormValues = z.infer<typeof submitToolSchema>;
