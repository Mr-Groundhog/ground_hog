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
import { Check, X, Eye, RefreshCw, Mail } from "lucide-react";
import { approveStation, rejectStation } from "../actions";
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
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
};

function toLocalDatetimeValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export function PublicStationsList({ data, total, page, limit, totalPages }: Props) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [creditCode, setCreditCode] = useState("");
  const [amount, setAmount] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");

  const openReview = (s: any) => {
    setCurrent(s);
    setCreditCode("");
    setAmount("");
    setExpireAt("");
    setReviewNote("");
    setReviewOpen(true);
  };

  const openReject = (s: any) => {
    setRejectTarget(s);
    setRejectNote("");
    setRejectOpen(true);
  };

  const handleApprove = async () => {
    if (!current) return;
    startLoading();
    try {
      const res = await approveStation(current.id, {
        creditCode,
        amount: Number(amount),
        expireAt: new Date(expireAt).toISOString(),
        reviewNote: reviewNote || undefined,
      });
      // 审核通过后将额度码等信息发送到用户邮箱
      try {
        const resp = await fetch("/api/send-station-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: res.email,
            url: res.url,
            creditCode: res.creditCode,
            amount: res.amount,
            expireAt: res.expireAt,
          }),
        });
        const json = await resp.json();
        if (!json.success) {
          toast.warning(`已通过审核，但邮件发送失败：${json.message}`);
        } else {
          toast.success("已通过，额度码已发送至用户邮箱");
        }
      } catch {
        toast.warning("已通过审核，但邮件发送请求失败");
      }
      setReviewOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    startLoading();
    try {
      await rejectStation(rejectTarget.id, rejectNote || undefined);
      toast.success("已拒绝");
      setRejectOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
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
    router.push(`/dashboard/public-stations?${sp.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", newPage.toString());
    router.push(`/dashboard/public-stations?${sp.toString()}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") updateQuery({ search });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="搜索站点 / 邮箱 / 模型..."
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
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已拒绝</option>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>站点 URL</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>支持模型</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="max-w-[180px]">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:underline break-all"
                    >
                      {s.url}
                    </a>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                    {s.keyValue}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate" title={s.models}>
                    {s.models}
                  </TableCell>
                  <TableCell className="text-xs">{s.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.status === "APPROVED"
                          ? "default"
                          : s.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {STATUS_LABEL[s.status] || s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            title="通过"
                            onClick={() => openReview(s)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-600"
                            title="拒绝"
                            onClick={() => openReject(s)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {s.status === "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-cyan-500 hover:text-cyan-600"
                          title="重新发送邮件"
                          onClick={async () => {
                            startLoading();
                            try {
                              const resp = await fetch("/api/send-station-approval", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  email: s.email,
                                  url: s.url,
                                  creditCode: s.creditCode,
                                  amount: s.amount,
                                  expireAt: s.expireAt,
                                }),
                              });
                              const json = await resp.json();
                              toast[json.success ? "success" : "warning"](
                                json.success ? "邮件已重发" : `重发失败：${json.message}`
                              );
                            } finally {
                              stopLoading();
                            }
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        title="查看详情"
                        onClick={() => openReview({ ...s, _readonly: true })}
                      >
                        <Eye className="h-4 w-4" />
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

      {/* 审核弹窗 */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {current?.status === "PENDING" ? "审核公益站" : "公益站详情"}
            </DialogTitle>
            <DialogDescription>
              {current?.status === "PENDING"
                ? "填写管理员额度码、额度与失效时间，通过后邮件将下发至用户邮箱。"
                : "该申请已审核。"}
            </DialogDescription>
          </DialogHeader>

          {current && (
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
              <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1.5">
                <div>
                  <span className="text-muted-foreground">站点：</span>
                  <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all">
                    {current.url}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Key：</span>
                  <span className="font-mono break-all">{current.keyValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">支持模型：</span>
                  {current.models}
                </div>
                <div>
                  <span className="text-muted-foreground">邮箱：</span>
                  {current.email}
                </div>
                {current.status === "APPROVED" && (
                  <>
                    <div>
                      <span className="text-muted-foreground">额度码：</span>
                      <span className="font-mono">{current.creditCode}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">额度：</span>${current.amount}
                    </div>
                    <div>
                      <span className="text-muted-foreground">失效时间：</span>
                      {current.expireAt ? new Date(current.expireAt).toLocaleString() : "-"}
                    </div>
                  </>
                )}
                {current.reviewNote && (
                  <div>
                    <span className="text-muted-foreground">备注：</span>
                    {current.reviewNote}
                  </div>
                )}
              </div>

              {current.status === "PENDING" && (
                <>
                  <div className="space-y-1.5">
                    <Label>
                      额度码（手动粘贴）<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="平台生成的额度码"
                      value={creditCode}
                      onChange={(e) => setCreditCode(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>
                        额度（美元）<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="5"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        失效时间<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="datetime-local"
                        value={expireAt}
                        onChange={(e) => setExpireAt(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>审核备注（可选）</Label>
                    <Textarea
                      placeholder="如：欢迎加入公益站计划"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleApprove}>
                    通过并发送邮件
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 拒绝弹窗 */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝公益站申请</DialogTitle>
            <DialogDescription>可填写拒绝原因（可选），仅记录不发送邮件。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="拒绝原因（可选）"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <Button variant="destructive" className="w-full" onClick={handleReject}>
              确认拒绝
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
