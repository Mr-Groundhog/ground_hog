import { z } from "zod";

export const toolSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  url: z.string().min(1, "链接/路由不能为空"),
  icon: z.string().optional(),
  version: z.string().optional(),
  category: z.string().min(1, "分类不能为空"),
  status: z.enum(["NORMAL", "DEBUG", "UPDATE", "MAINTENANCE"]).default("NORMAL"),
  type: z.enum(["LOCAL", "EXTERNAL"]).default("EXTERNAL"),
});

export type ToolFormValues = z.infer<typeof toolSchema>;
