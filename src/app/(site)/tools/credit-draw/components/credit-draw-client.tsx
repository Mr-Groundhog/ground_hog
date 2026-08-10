"use client";

import { useState, useCallback } from "react";
import { Gift, Send, PartyPopper, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoadingStore } from "@/store/loading-store";
import { toast } from "sonner";
import { submitComment, getRecentComments, getPoolStats } from "../actions";

interface CommentItem {
  id: string;
  nickname: string;
  content: string;
  claimed: boolean;
  amount: string | null;
  createdAt: string;
}

interface PoolStats {
  total: number;
  claimed: number;
  available: number;
}

interface Props {
  initialComments: CommentItem[];
  initialStats: PoolStats;
}

export function CreditDrawClient({ initialComments, initialStats }: Props) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [stats, setStats] = useState<PoolStats>(initialStats);
  const [prize, setPrize] = useState<{ code: string; amount: string } | null>(null);
  const { startLoading, stopLoading } = useLoadingStore();

  const refresh = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([getRecentComments(), getPoolStats()]);
      setComments(
        (c as CommentItem[]).map((x) => ({
          ...x,
          createdAt:
            typeof x.createdAt === "string"
              ? x.createdAt
              : new Date(x.createdAt).toISOString(),
        }))
      );
      setStats(s as PoolStats);
    } catch {
      /* 静默刷新失败 */
    }
  }, []);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      toast.error("请填写昵称");
      return;
    }
    if (!content.trim()) {
      toast.error("请填写评论");
      return;
    }
    startLoading();
    try {
      const res = await submitComment({ nickname: nickname.trim(), content: content.trim() });
      if (res.limited) {
        toast.info(res.message);
        return;
      }
      if (res.success && res.claimed) {
        setPrize({ code: res.code, amount: res.amount });
      } else if (res.success && !res.claimed) {
        toast.info(res.message);
      }
      setNickname("");
      setContent("");
      await refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "提交失败";
      toast.error(msg);
    } finally {
      stopLoading();
    }
  };

  const copyPrize = async () => {
    if (!prize) return;
    try {
      await navigator.clipboard.writeText(prize.code);
      toast.success("额度码已复制");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  const progress = stats.total > 0 ? Math.round((stats.claimed / stats.total) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* 奖池进度 */}
      <section className="rounded-2xl border border-cyan-500/30 bg-zinc-950/60 backdrop-blur p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Gift className="h-5 w-5" />
            <span className="font-semibold tracking-wide">奖池进度</span>
          </div>
          <div className="text-sm text-zinc-400 flex items-center gap-1">
            <Users className="h-4 w-4" /> 已领取 {stats.claimed} / {stats.total}
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          剩余可抽码：<span className="text-cyan-300 font-mono">{stats.available}</span> 张
          {stats.available === 0 && " · 奖池已空，评论仍可上墙"}
        </p>
      </section>

      {/* 评论表单 */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur p-6 md:p-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Send className="h-4 w-4 text-cyan-400" /> 留下建议或者使用记录
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-300">昵称</Label>
            <Input
              placeholder="你想展示的名字"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">评论</Label>
            <Textarea
              placeholder="说点什么吧～（每个 IP 限参与一次）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-50 min-h-[90px]"
            />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-semibold"
            onClick={handleSubmit}
          >
            提交评论并抽奖
          </Button>
          <p className="text-xs text-zinc-500 text-center">
            提交成功后立即抽奖，码由网关平台生成，中奖即展示。
          </p>
        </div>
      </section>

      {/* 评论墙 */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">评论墙</h2>
        {comments.length === 0 ? (
          <p className="text-zinc-500 text-sm">还没有评论，快来抢占前排～</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-cyan-300">{c.nickname}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                  {c.content}
                </p>
                {c.claimed && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400">
                    <PartyPopper className="h-3 w-3" /> 已领取 ${c.amount} 额度
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 中奖弹窗 */}
      <Dialog open={!!prize} onOpenChange={(o) => !o && setPrize(null)}>
        <DialogContent className="bg-zinc-950 border-cyan-500/40 text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-cyan-300 flex items-center justify-center gap-2">
              <PartyPopper className="h-7 w-7" /> 恭喜中奖！
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-400 mb-3">你抽中了</p>
            <p className="text-3xl font-bold text-emerald-300 mb-1">
              ${prize?.amount}
            </p>
            <p className="text-xs text-zinc-500 mb-4">额度码（请复制保存）</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xl font-mono font-bold tracking-widest text-cyan-300 bg-zinc-900 px-3 py-2 rounded-md break-all">
                {prize?.code}
              </code>
              <Button
                size="icon"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={copyPrize}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold"
            onClick={() => setPrize(null)}
          >
            好的，朕收下了
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
