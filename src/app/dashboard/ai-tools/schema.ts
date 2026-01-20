import { z } from "zod";

export const aiToolSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().min(1, "描述不能为空"),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
});

export type AiToolFormValues = z.infer<typeof aiToolSchema>;
