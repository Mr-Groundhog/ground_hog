import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(2, "用户名至少需要2个字符").max(50, "用户名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  nickname: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.boolean().default(true),
  bio: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;
