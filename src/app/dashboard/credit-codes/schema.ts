import { z } from "zod";

/** 导入奖池：批量码（每行一个）+ 本批次统一额度（美元） */
export const importCodesSchema = z.object({
  codes: z
    .string()
    .min(1, "请粘贴额度码，每行一个")
    .refine(
      (v) => v.split(/\r?\n/).filter((s) => s.trim().length > 0).length > 0,
      "请至少提供一个额度码"
    ),
  amount: z.coerce.number().positive("额度必须为正数").max(100000, "额度过大"),
  batchNote: z.string().max(100, "备注过长").optional().or(z.literal("")),
});

export type ImportCodesValues = z.infer<typeof importCodesSchema>;
