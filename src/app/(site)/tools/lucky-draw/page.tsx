"use client";

import { useEffect, useRef, useState } from "react";
import { LotteryScene } from "./components/lottery-scene";
import { ControlPanel } from "./components/control-panel";
import { useLotteryStore } from "./components/lottery-store";
import { Button } from "@/components/ui/button";
import { Play, Square, Maximize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LuckyDrawPage() {
  const { status, startLottery, stopLottery, resetWinners } = useLotteryStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMainAction = () => {
    if (status === 'idle' || status === 'show-winner') {
      startLottery();
    } else if (status === 'running') {
      stopLottery();
    }
  };

  useEffect(() => {
    // Auto enter fullscreen on mount? Browsers block this.
    // We can show a toast or overlay.
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      {/* 3D Scene Background */}
      <LotteryScene />

      {/* Control Panel Sidebar */}
      <ControlPanel />

      {/* Header / Title */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-0">
        <h1 className="text-4xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-teal-200 to-teal-500 uppercase drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
          年会盛典 幸运抽奖
        </h1>
        <p className="mt-2 text-teal-200/60 tracking-[0.5em] text-sm">
          时空穿梭版
        </p>
      </div>

      {/* Main Action Button */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-4 z-10">
        <Button
          onClick={handleMainAction}
          className={cn(
            "h-16 px-12 rounded-full text-xl font-bold tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_50px_rgba(45,212,191,0.6)] hover:scale-105",
            status === 'running' 
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/50" 
              : "bg-teal-500 hover:bg-teal-400 text-black"
          )}
        >
          {status === 'running' ? (
            <>
              <Square className="mr-2 w-6 h-6 fill-current" /> 停止
            </>
          ) : (
            <>
              <Play className="mr-2 w-6 h-6 fill-current" /> {status === 'show-winner' ? '下一轮' : '开始抽奖'}
            </>
          )}
        </Button>

        {status !== 'running' && (
          <Button
            variant="outline"
            className="h-16 w-16 rounded-full border-white/20 bg-black/40 hover:bg-white/10 text-white"
            onClick={() => {
              if(confirm('确定要重置所有中奖记录吗？')) {
                resetWinners();
              }
            }}
            title="重置所有记录"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Fullscreen Toggle (Top Right) */}
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 z-20"
        onClick={toggleFullscreen}
      >
        <Maximize2 className="w-6 h-6" />
      </Button>
      
      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
