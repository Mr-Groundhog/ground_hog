import { z } from "zod";

export const friendLinkSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().optional(),
  logo: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  coverImage: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  email: z.string().email("请输入有效的邮箱").optional().or(z.literal("")),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
});

export type FriendLinkFormValues = z.infer<typeof friendLinkSchema>;
