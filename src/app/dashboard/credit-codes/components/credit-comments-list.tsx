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
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, MessageSquare } from "lucide-react";
import {
  deleteCreditComment,
  batchDeleteCreditComments,
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

export function CreditCommentsList({ data, total, page, limit, totalPages }: Props) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    startLoading();
    try {
      await deleteCreditComment(id);
      toast.success("已删除");
      setSelected((prev) => prev.filter((x) => x !== id));
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    } finally {
      stopLoading();
    }
  };

  const handleBatchDelete = async () => {
    if (selected.length === 0) return;
    startLoading();
    try {
      const res = await batchDeleteCreditComments(selected);
      toast.success(`已删除 ${res.deleted} 条评论`);
      setSelected([]);
    } catch (error: any) {
      toast.error(error?.message || "批量删除失败");
    } finally {
      stopLoading();
    }
  };

  const handlePageChange = (newPage: number) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", newPage.toString());
    router.push(`/dashboard/credit-codes?${sp.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-cyan-400" /> 活动评论
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> 删除选中（{selected.length}）
            </Button>
          )}
          <Button variant="outline" size="icon" title="刷新" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected.length === data.length && data.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? data.map((d) => d.id) : [])
                  }
                />
              </TableHead>
              <TableHead>昵称</TableHead>
              <TableHead>内容</TableHead>
              <TableHead>是否中奖</TableHead>
              <TableHead>额度</TableHead>
              <TableHead>提交 IP</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  暂无评论
                </TableCell>
              </TableRow>
            ) : (
              data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected.includes(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.nickname}</TableCell>
                  <TableCell className="max-w-[360px] truncate" title={c.content}>
                    {c.content}
                  </TableCell>
                  <TableCell>
                    {c.claimed ? (
                      <Badge variant="default">已中奖</Badge>
                    ) : (
                      <Badge variant="secondary">未中奖</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.amount ? (
                      <span className="text-emerald-500 font-semibold">${c.amount}</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.ip || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      title="删除"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">共 {total} 条评论</div>
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
    </div>
  );
}
