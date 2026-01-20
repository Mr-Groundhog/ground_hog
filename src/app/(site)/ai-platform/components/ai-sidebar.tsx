"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, MessageSquare, Image as ImageIcon, Code, Music, Video, Briefcase, PenTool, MoreHorizontal } from "lucide-react";

const CATEGORIES = [
  { id: "全部", icon: LayoutGrid },
  { id: "对话聊天", icon: MessageSquare },
  { id: "图像生成", icon: ImageIcon },
  { id: "编程辅助", icon: Code },
  { id: "音频处理", icon: Music },
  { id: "视频制作", icon: Video },
  { id: "办公效率", icon: Briefcase },
  { id: "设计工具", icon: PenTool },
  { id: "其他", icon: MoreHorizontal },
];

const HOT_TAGS = ["GPT-4", "开源", "生产力", "设计", "免费", "API"];

interface AiSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export function AiSidebar({ selectedCategory, onSelectCategory, selectedTag, onSelectTag }: AiSidebarProps) {
  return (
    <div className="w-full lg:w-64 shrink-0 space-y-8">
      {/* Category Filter */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-zinc-400">分类筛选</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-9",
                selectedCategory === cat.id 
                  ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              )}
              onClick={() => onSelectCategory(cat.id)}
            >
              <cat.icon className="h-4 w-4" />
              {cat.id}
            </Button>
          ))}
        </div>
      </div>

      {/* Hot Tags */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-zinc-400">热门标签</h3>
        <div className="flex flex-wrap gap-2">
          {HOT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(selectedTag === tag ? "" : tag)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
                selectedTag === tag
                  ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
