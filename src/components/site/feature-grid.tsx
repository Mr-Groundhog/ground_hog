"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "神经网络 v2",
    desc: "针对高频交易模拟优化的自主强化学习代理。",
    tag: "PYTHON",
    tagColor: "text-cyan-400 border-cyan-500/30",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=server%20rack%20data%20center%20dark%20cinematic%20high%20tech&image_size=landscape_4_3"
  },
  {
    title: "量子命令行",
    desc: "用于分布式账本交互和分析的高速命令行界面。",
    tag: "RUST",
    tagColor: "text-green-400 border-green-500/30",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=abstract%20geometric%20sphere%20network%20dark%20sci-fi%20complex&image_size=landscape_4_3"
  },
  {
    title: "网格网络",
    desc: "专为隐私优先通信层设计的P2P去中心化网络协议。",
    tag: "GO",
    tagColor: "text-blue-400 border-blue-500/30",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=globe%20earth%20digital%20network%20dark%20interface%20hologram&image_size=landscape_4_3"
  }
];

export function FeatureGrid() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
          <h2 className="text-lg font-semibold text-white">活动子系统</h2>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <ChevronLeft size={14} />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <ChevronRight size={14} />
           </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 transition-colors hover:border-zinc-700">
            {/* Image Area */}
            <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
              <img 
                src={feature.image} 
                alt={feature.title}
                className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className={`absolute right-3 top-3 rounded border px-1.5 py-0.5 text-[10px] font-bold ${feature.tagColor} bg-black/50 backdrop-blur-sm`}>
                {feature.tag}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
              <p className="mb-6 h-10 text-sm text-zinc-400 line-clamp-2">
                {feature.desc}
              </p>
              <Button className="w-full bg-zinc-800 text-xs font-medium text-white hover:bg-zinc-700">
                执行探测
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
