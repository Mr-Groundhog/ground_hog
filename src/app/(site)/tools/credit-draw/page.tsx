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
      <div className="container px-4 py-10 md:py-14 max-w-5xl mx-auto">
        {/* 顶部标题栏（紧凑一行） */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
              额度兑换码抽奖
            </h1>
            <span className="hidden sm:inline text-xs text-zinc-500">
              留下建议或使用记录即抽额度
            </span>
          </div>
          <p className="text-xs md:text-sm text-cyan-400/90">
            右下角参与共建可获得更多额度 →
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
