"use client";

import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-8 md:p-12">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#00C8D215,transparent)]"></div>

      <div className="relative flex h-full flex-col items-center justify-center text-center">
        {/* Tag */}
        <div className="mb-6 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1">
          <span className="text-xs font-medium text-cyan-400">系统状态：已优化</span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
          构建 <br />
          <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            数字现实
          </span>
        </h1>

        {/* Subheading */}
        <p className="mb-8 max-w-2xl text-sm text-zinc-400 md:text-base">
          全栈工程与先进机器学习的碰撞。4.0版本已集成并持续扩展中。
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button className="h-10 gap-2 bg-cyan-400 px-6 text-black hover:bg-cyan-500">
            <Zap size={16} className="fill-black" />
            初始化项目
          </Button>
          <Button variant="outline" className="h-10 border-zinc-700 bg-zinc-900 px-6 text-white hover:bg-zinc-800 hover:text-white">
            查看存档
          </Button>
        </div>

        {/* Status Text (Bottom Left) */}
        <div className="absolute bottom-4 left-6 flex flex-col gap-1 text-[10px] font-mono text-zinc-600 md:flex-row md:gap-4">
          <span>延迟: 14MS</span>
          <span>运行时间: 99.998%</span>
          <span>坐标: 49.7128° N, 74.0060° W</span>
        </div>
      </div>
    </div>
  );
}
