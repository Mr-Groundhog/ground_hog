"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AiHero({ search, onSearchChange }: { search: string; onSearchChange: (val: string) => void }) {
  return (
    <div className="relative w-full py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
        >
          发现未来的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">无限可能</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-zinc-400 max-w-2xl mb-10"
        >
          汇集全球最前沿的 AI 工具与模型，为您的工作流注入超凡动力。
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-2xl"
        >
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <Input 
            type="text" 
            placeholder="搜索 AI 工具 (例如: ChatGPT, Midjourney)..." 
            className="w-full h-12 pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-full focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              <span className="sr-only">Clear</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
