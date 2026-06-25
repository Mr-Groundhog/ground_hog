"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PromptHero } from "./components/prompt-hero";
import { PromptSidebar } from "./components/prompt-sidebar";
import { PromptGrid } from "./components/prompt-grid";
import { PromptDetailDialog } from "./components/prompt-detail-dialog";
import { PromptTemplateFab } from "./components/prompt-template-fab";
import { PROMPT_CATEGORIES } from "@/config/prompt-categories";
import { cn } from "@/lib/utils";

interface PromptTemplatesClientProps {
  initialTemplates: any[];
  hotTemplates: any[];
}

export function PromptTemplatesClient({ initialTemplates, hotTemplates }: PromptTemplatesClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 客户端筛选逻辑
  const filteredTemplates = initialTemplates.filter(template => {
    // 1. 分类筛选
    if (selectedCategory !== "全部" && template.category !== selectedCategory) {
      return false;
    }

    // 2. 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        template.title.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.content.toLowerCase().includes(searchLower) ||
        (template.tags && template.tags.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // 3. 标签筛选
    if (selectedTag) {
      if (!template.tags || !template.tags.toLowerCase().includes(selectedTag.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setDetailOpen(true);
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag);
    setSelectedCategory("全部");
  };

  return (
    <div className="min-h-screen text-zinc-100">
      {/* Hero 搜索区 */}
      <PromptHero search={search} onSearchChange={setSearch} totalCount={initialTemplates.length} />
      
      {/* 分类快速筛选标签 */}
      <div className="container mx-auto px-4 -mt-4 mb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["全部", ...PROMPT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedTag("");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 border",
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_-3px_rgba(6,182,212,0.4)]"
                  : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 主体布局 */}
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6">
        {/* 左侧边栏 */}
        <PromptSidebar 
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedTag("");
          }}
          hotTemplates={hotTemplates}
          onSelectTag={handleSelectTag}
        />
        
        {/* 右侧主体 - 卡片网格 */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">
              {selectedCategory === "全部" ? "全部模板" : selectedCategory}
              <span className="ml-2 text-sm font-normal text-zinc-500">
                共 {filteredTemplates.length} 个
              </span>
            </h2>
            {selectedTag && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">标签:</span>
                <button
                  onClick={() => setSelectedTag("")}
                  className="px-2 py-0.5 rounded-md text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  #{selectedTag} ×
                </button>
              </div>
            )}
          </div>
          
          <PromptGrid 
            templates={filteredTemplates} 
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </div>

      {/* 详情弹窗 */}
      <PromptDetailDialog 
        template={selectedTemplate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSelectTag={handleSelectTag}
      />

      {/* 悬浮提交按钮 */}
      <PromptTemplateFab />
    </div>
  );
}
