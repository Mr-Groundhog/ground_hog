"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Ban,
  RefreshCw,
  Ticket,
  Upload,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  importCreditCodes,
  disableCreditCode,
  deleteCreditCode,
  setActiveBatch,
  getBatchCodes,
} from "../actions";
import { toast } from "sonner";
import { useLoadingStore } from "@/store/loading-store";
import { useRouter } from "next/navigation";

interface BatchItem {
  batchId: string;
  total: number;
  available: number;
  claimed: number;
  disabled: number;
  batchNote: string | null;
  createdAt: string | null;
  isActive: boolean;
}

interface Props {
  batches: BatchItem[];
  activeBatchId: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "可领取",
  CLAIMED: "已领取",
  DISABLED: "已停用",
};

export function CreditCodesList({ batches, activeBatchId }: Props) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [importOpen, setImportOpen] = useState(false);
  const [codes, setCodes] = useState("");
  const [amount, setAmount] = useState("5");
  const [batchNote, setBatchNote] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [batchCodes, setBatchCodes] = useState<Record<string, any[]>>({});
  const [activeSelect, setActiveSelect] = useState(activeBatchId ?? "");

  // 前端解析 txt：每行一个码，自动去除空白与空行
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) {
        toast.error("文件中未识别到任何额度码");
        return;
      }
      const parsed = lines.map((l) => l.split(/[,\t]/)[0].trim()).filter(Boolean);
      setCodes(parsed.join("\n"));
      toast.success(`已从文件识别 ${parsed.length} 个额度码`);
    };
    reader.onerror = () => toast.error("文件读取失败");
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!codes.trim()) {
      toast.error("请粘贴额度码");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("额度必须为正数");
      return;
    }
    startLoading();
    try {
      const res = await importCreditCodes({
        codes,
        amount: amt,
        batchNote: batchNote || undefined,
      });
      toast.success(
        `导入完成：新增 ${res.created} 条${res.skipped ? `，跳过 ${res.skipped} 条已存在` : ""}`
      );
      setImportOpen(false);
      setCodes("");
      setBatchNote("");
    } catch (error: any) {
      toast.error(error?.message || "导入失败");
    } finally {
      stopLoading();
    }
  };

  const toggleExpand = async (batchId: string) => {
    if (expanded === batchId) {
      setExpanded(null);
      return;
    }
    setExpanded(batchId);
    if (!batchCodes[batchId]) {
      startLoading();
      try {
        const res = await getBatchCodes(batchId, 1, 50);
        setBatchCodes((prev) => ({ ...prev, [batchId]: res.data }));
      } catch (error: any) {
        toast.error(error?.message || "加载明细失败");
      } finally {
        stopLoading();
      }
    }
  };

  const handleSetActive = async (batchId: string) => {
    startLoading();
    try {
      await setActiveBatch(batchId || null);
      setActiveSelect(batchId);
      toast.success(batchId ? "已设为当前抽奖批次" : "已取消批次限制");
    } catch (error: any) {
      toast.error(error?.message || "设置失败");
    } finally {
      stopLoading();
    }
  };

  const handleDisable = async (id: string) => {
    startLoading();
    try {
      await disableCreditCode(id);
      toast.success("已停用");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id: string) => {
    startLoading();
    try {
      await deleteCreditCode(id);
      toast.success("已删除");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Ticket className="h-5 w-5 text-cyan-400" /> 额度码奖池（按批次）
      </div>

      {/* 当前抽奖批次 + IP 重置 */}
      <div className="flex flex-wrap items-end gap-4 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="flex items-center gap-2">
          <Label className="text-zinc-300 shrink-0">当前抽奖批次</Label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={activeSelect}
            onChange={(e) => handleSetActive(e.target.value)}
          >
            <option value="">不限批次（全部可领）</option>
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchNote || b.batchId}
              </option>
            ))}
          </select>
        </div>
        <Button
          className="ml-auto bg-cyan-600 hover:bg-cyan-500 text-white"
          onClick={() => setImportOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> 导入奖池
        </Button>
      </div>

      {/* 批次卡片列表（默认折叠） */}
      <div className="space-y-2">
        {batches.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-zinc-500">
            暂无批次，点击「导入奖池」批量添加额度码
          </div>
        ) : (
          batches.map((b) => {
            const isOpen = expanded === b.batchId;
            return (
              <div key={b.batchId} className="rounded-md border border-zinc-800">
                <div className="flex items-center gap-3 px-3 py-3">
                  <button
                    className="text-zinc-400 hover:text-zinc-100"
                    onClick={() => toggleExpand(b.batchId)}
                    title={isOpen ? "收起" : "展开明细"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {b.batchNote || "未命名批次"}
                      </span>
                      {b.isActive && (
                        <Badge className="bg-cyan-600 hover:bg-cyan-700">
                          <Star className="mr-1 h-3 w-3" /> 当前抽奖
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono truncate">
                      {b.batchId}
                      {b.createdAt && ` · ${new Date(b.createdAt).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                    <span>共 {b.total}</span>
                    <span className="text-emerald-500">可领 {b.available}</span>
                    <span className="text-zinc-400">已领 {b.claimed}</span>
                    <span className="text-red-400">停用 {b.disabled}</span>
                  </div>
                  <Button
                    variant={b.isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleSetActive(b.isActive ? "" : b.batchId)}
                  >
                    {b.isActive ? "取消当前" : "设为当前"}
                  </Button>
                </div>

                {isOpen && (
                  <div className="border-t border-zinc-800 px-3 py-3">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>额度码</TableHead>
                            <TableHead>额度</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>领取者 IP</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(batchCodes[b.batchId] ?? []).map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-mono font-medium">{c.code}</TableCell>
                              <TableCell>
                                <span className="text-emerald-500 font-semibold">${c.amount}</span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    c.status === "AVAILABLE"
                                      ? "default"
                                      : c.status === "CLAIMED"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {STATUS_LABEL[c.status] || c.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {c.claimIp || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {c.status === "AVAILABLE" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-orange-500 hover:text-orange-600"
                                      title="停用"
                                      onClick={() => handleDisable(c.id)}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    title="删除"
                                    onClick={() => handleDelete(c.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {!batchCodes[b.batchId] && (
                      <p className="text-xs text-zinc-500 py-2">加载中…</p>
                    )}
                    {batchCodes[b.batchId]?.length === 0 && (
                      <p className="text-xs text-zinc-500 py-2">该批次暂无额度码</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 导入奖池 Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入额度码奖池</DialogTitle>
            <DialogDescription>
              每行一个额度码，本批次将统一使用下方额度。重复码自动跳过。导入后将以独立批次显示。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>额度码（每行一个）</Label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-md border border-cyan-600/60 bg-cyan-600/10 px-2.5 py-1.5 text-xs text-cyan-300 transition-colors hover:bg-cyan-600/20 hover:text-cyan-200">
                  <Upload className="h-3.5 w-3.5" /> 导入 txt 自动识别
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>
              <Textarea
                placeholder={"sk-xxxxxx\nabc123def456\ngpt-xxxxx"}
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
                className="min-h-[160px] font-mono"
              />
              {codes.trim().split("\n").filter((l) => l.trim()).length > 0 && (
                <p className="text-xs text-zinc-500">
                  已识别 {codes.trim().split("\n").filter((l) => l.trim()).length} 个额度码
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>本批次额度（美元）</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>批次备注（可选）</Label>
                <Input
                  placeholder="如：活动第一批"
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
              onClick={handleImport}
            >
              导入奖池
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
