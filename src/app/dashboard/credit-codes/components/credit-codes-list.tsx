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
import { Plus, Trash2, Ban, RefreshCw, Ticket } from "lucide-react";
import {
  importCreditCodes,
  disableCreditCode,
  deleteCreditCode,
} from "../actions";
import { toast } from "sonner";
import { useLoadingStore } from "@/store/loading-store";
import { useRouter } from "next/navigation";

interface Props {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "可领取",
  CLAIMED: "已领取",
  DISABLED: "已停用",
};

export function CreditCodesList({ data, total, page, limit, totalPages }: Props) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [importOpen, setImportOpen] = useState(false);
  const [codes, setCodes] = useState("");
  const [amount, setAmount] = useState("5");
  const [batchNote, setBatchNote] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

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

  const handleDisable = async (id: string) => {
    startLoading();
    try {
      await disableCreditCode(id);
      toast.success("已停用");
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
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    } finally {
      stopLoading();
    }
  };

  const updateQuery = (params: Record<string, string>) => {
    const sp = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    sp.set("page", "1");
    router.push(`/dashboard/credit-codes?${sp.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", newPage.toString());
    router.push(`/dashboard/credit-codes?${sp.toString()}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") updateQuery({ search });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Ticket className="h-5 w-5 text-cyan-400" /> 额度码奖池
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="搜索额度码..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              updateQuery({ status: e.target.value });
            }}
          >
            <option value="">全部状态</option>
            <option value="AVAILABLE">可领取</option>
            <option value="CLAIMED">已领取</option>
            <option value="DISABLED">已停用</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            title="刷新"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setImportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 导入奖池
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>额度码</TableHead>
              <TableHead>额度</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>领取者 IP</TableHead>
              <TableHead>批次备注</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  暂无数据，点击「导入奖池」批量添加额度码
                </TableCell>
              </TableRow>
            ) : (
              data.map((c) => (
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
                  <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                    {c.batchNote || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">共 {total} 条记录</div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            下一页
          </Button>
        </div>
      </div>

      {/* 导入奖池 Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入额度码奖池</DialogTitle>
            <DialogDescription>
              每行一个额度码，本批次将统一使用下方额度。重复码自动跳过。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>额度码（每行一个）</Label>
              <Textarea
                placeholder={"sk-xxxxxx\nabc123def456\ngpt-xxxxx"}
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
                className="min-h-[160px] font-mono"
              />
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
            <Button className="w-full" onClick={handleImport}>
              导入奖池
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
