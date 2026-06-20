"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface SiteVisit {
  id: number;
  pageUrl: string;
  device: string;
  referrer: string | null;
  ip: string;
  createdAt: Date;
}

interface SiteVisitsListProps {
  data: SiteVisit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function SiteVisitsList({
  data,
  total,
  page,
  totalPages,
}: SiteVisitsListProps) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/site-visits?page=${newPage}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>页面 URL</TableHead>
              <TableHead>设备</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>IP 地址</TableHead>
              <TableHead>访问时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="max-w-[280px] truncate font-medium" title={visit.pageUrl}>
                    {visit.pageUrl}
                  </TableCell>
                  <TableCell>{visit.device}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={visit.referrer ?? ""}>
                    {visit.referrer ?? "-"}
                  </TableCell>
                  <TableCell>{visit.ip}</TableCell>
                  <TableCell>
                    {new Date(visit.createdAt).toLocaleString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
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
