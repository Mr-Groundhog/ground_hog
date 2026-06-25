export const PROMPT_CATEGORIES = [
  "写作", "编程", "翻译", "营销", "学术", "生活", "其他"
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];
