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
import { useRouter } from "next/navigation";
import { retryFailedEmailAction } from "../actions";
import { toast } from "sonner";
import { useLoadingStore } from "@/store/loading-store";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface EmailLogsListProps {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function EmailLogsList({ data, total, page, totalPages }: EmailLogsListProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();

  const handleRetry = async (logId: string) => {
    startLoading();
    try {
      await retryFailedEmailAction(logId);
      toast.success("邮件重试成功");
      // 刷新页面
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "重试失败");
    } finally {
      stopLoading();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />已发送</Badge>;
      case "FAILED":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />发送失败</Badge>;
      case "PENDING":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />发送中</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };



  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/email-logs?page=${newPage}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>发件人</TableHead>
              <TableHead>收件人</TableHead>
              <TableHead>主题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>发送次数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>发送时间</TableHead>
              <TableHead className="text-right">操作</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.fromEmail}</TableCell>
                  <TableCell>{log.toEmail}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>{log.sendCount}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {log.sentAt ? new Date(log.sentAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.status === "FAILED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(log.id)}
                        title="重试发送"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重试
                      </Button>
                    )}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          共 {total} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            上一页
          </Button>
          <span className="text-sm">
            第 {page} 页，共 {totalPages} 页
          </span>
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