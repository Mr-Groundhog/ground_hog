"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROMPT_CATEGORIES } from "@/config/prompt-categories";
import { LayoutGrid, PenTool, Code, Languages, Megaphone, GraduationCap, Coffee, MoreHorizontal, Flame, Eye } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  "全部": LayoutGrid,
  "写作": PenTool,
  "编程": Code,
  "翻译": Languages,
  "营销": Megaphone,
  "学术": GraduationCap,
  "生活": Coffee,
  "其他": MoreHorizontal,
};

interface PromptSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  hotTemplates: any[];
  onSelectTag: (tag: string) => void;
}

export function PromptSidebar({ selectedCategory, onSelectCategory, hotTemplates, onSelectTag }: PromptSidebarProps) {
  const categories = ["全部", ...PROMPT_CATEGORIES];

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-6">
      {/* 分类导航 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-400">分类导航</h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
            return (
              <Button
                key={cat}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9",
                  selectedCategory === cat 
                    ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
                onClick={() => onSelectCategory(cat)}
              >
                <Icon className="h-4 w-4" />
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 热门榜 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-400 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          热门模板
        </h3>
        {hotTemplates.length === 0 ? (
          <p className="text-xs text-zinc-500">暂无数据</p>
        ) : (
          <div className="space-y-2">
            {hotTemplates.map((template, index) => (
              <div
                key={template.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group"
                onClick={() => {
                  // 点击热门项时筛选该分类
                  onSelectCategory(template.category);
                }}
              >
                <span className={cn(
                  "flex-shrink-0 w-5 h-5 rounded text-xs flex items-center justify-center font-bold",
                  index < 3 ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800 text-zinc-500"
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate group-hover:text-cyan-400 transition-colors">
                    {template.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 text-xs">
                  <span className="text-red-400">♥</span>
                  <span>{template.likeCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
