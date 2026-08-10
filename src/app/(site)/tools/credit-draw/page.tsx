import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditDrawClient } from "./components/credit-draw-client";
import { StationFab } from "./components/station-fab";
import { getRecentComments, getPoolStats } from "./actions";

export const revalidate = 60;

export default async function CreditDrawPage() {
  const [initialComments, initialStats] = await Promise.all([
    getRecentComments(),
    getPoolStats(),
  ]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      <div className="container px-4 py-10 md:py-14 max-w-3xl mx-auto">
        {/* 英雄区 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            限时活动 · 评论即抽额度
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            额度兑换码抽奖
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto">
            留下你的建议或使用记录，即可参与平台额度码抽取。每个 IP 限参与一次，中奖码当场展示、留言即刻上墙。
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl bg-zinc-800/50" />
              <Skeleton className="h-64 w-full rounded-2xl bg-zinc-800/50" />
            </div>
          }
        >
          <CreditDrawClient
            initialComments={initialComments as any}
            initialStats={initialStats as any}
          />
        </Suspense>
      </div>

      {/* 共建公益站 右下角浮动按钮 */}
      <StationFab />
    </div>
  );
}
