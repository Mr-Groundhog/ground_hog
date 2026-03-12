"use client";

import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WinnerDisplayProps {
  winner: string;
  onClose: () => void;
}

export function WinnerDisplay({ winner, onClose }: WinnerDisplayProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只有点击遮罩本身时才关闭（不是弹窗内容）
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] animate-fade-in pointer-events-auto"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-3xl shadow-2xl animate-bounce-in z-[10000] max-w-md w-full mx-4">
        {/* 关闭按钮 */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="bg-card rounded-3xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-20 h-20 text-yellow-500 animate-spin-slow" />
          </div>

          <h2 className="text-3xl font-bold mb-4">
            🎉 恭喜中奖 🎉
          </h2>

          <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-6">
            {winner}
          </div>

          <p className="text-muted-foreground text-lg mb-8">
            请到领奖台领取您的奖品！
          </p>

          <div className="flex gap-4 justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          {/* 底部关闭按钮 */}
          <Button
            onClick={onClose}
            size="lg"
            className="w-full"
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
