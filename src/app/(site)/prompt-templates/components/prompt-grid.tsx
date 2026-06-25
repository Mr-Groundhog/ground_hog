"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Zap } from "lucide-react";

interface PromptGridProps {
  templates: any[];
}

export function PromptGrid({ templates }: PromptGridProps) {
  if (templates.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-zinc-500 py-12">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-sm text-zinc-500 mb-1">暂无相关模板</p>
        <p className="text-xs text-zinc-600">试试其他分类或搜索关键词</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
        >
          <Link
            href={`/prompt-templates/${template.id}`}
            className="group relative flex flex-col rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 block"
          >
            {/* 顶部渐变装饰条 */}
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Card Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-zinc-100 truncate pr-2 group-hover:text-cyan-400 transition-colors duration-200 line-clamp-1">
                  {template.title}
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-zinc-900 text-zinc-400 border-zinc-800 shrink-0">
                  {template.category}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Tags */}
            {template.tags && (
              <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                {template.tags.split(/[,，]/).slice(0, 3).map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] text-zinc-500 bg-zinc-900/50 px-1.5 py-0.5 rounded">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 mt-auto border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {template.likeCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {template.viewCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {template.useCount || 0}
                </span>
              </div>
              {template.author && (
                <span className="truncate max-w-[100px]">
                  @{template.author}
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
