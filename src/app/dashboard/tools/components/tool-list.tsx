"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tool, ToolStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash, CheckCircle, XCircle } from "lucide-react";
import { ToolDialog } from "./tool-dialog";
import { deleteTool, updateToolStatus } from "../actions";
import { toast } from "sonner";

interface ToolListProps {
  data: Tool[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: string[];
}

export function ToolList({
  data,
  total,
  page,
  limit,
  totalPages,
  categories,
}: ToolListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/dashboard/tools?${params.toString()}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/dashboard/tools?${params.toString()}`);
    }
  };

  const openCreateDialog = () => {
    setSelectedTool(null);
    setDialogOpen(true);
  };

  const openEditDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除吗？")) {
      await deleteTool(id);
      toast.success("已删除");
    }
  };

  const handleStatusChange = async (id: string, status: ToolStatus) => {
    try {
      await updateToolStatus(id, status);
      toast.success(status === 'NORMAL' ? "已审核通过" : "已更新状态");
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NORMAL": return <Badge className="bg-green-500/15 text-green-500 hover:bg-green-500/25 border-0">正常</Badge>;
      case "DEBUG": return <Badge className="bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-0">调试</Badge>;
      case "UPDATE": return <Badge className="bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-0">更新</Badge>;
      case "MAINTENANCE": return <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-0">维护</Badge>;
      case "PENDING": return <Badge className="bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 border-0">待审核</Badge>;
      case "REJECTED": return <Badge className="bg-gray-500/15 text-gray-500 hover:bg-gray-500/25 border-0">已拒绝</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input 
          placeholder="搜索工具..." 
          className="max-w-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
        />
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> 新增工具
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>版本</TableHead>
              <TableHead>链接</TableHead>
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
              data.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tool.name}
                    </div>
                  </TableCell>
                  <TableCell>{tool.category}</TableCell>
                  <TableCell>
                    {tool.type === "LOCAL" ? (
                      <Badge variant="secondary">本地开发</Badge>
                    ) : (
                      <Badge variant="outline">在线工具</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(tool.status)}</TableCell>
                  <TableCell>{tool.version}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={tool.url}>
                    {tool.url}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {tool.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(tool.id, 'NORMAL')}
                              className="text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              通过审核
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(tool.id, 'REJECTED')}
                              className="text-orange-600 focus:text-orange-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              拒绝
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => openEditDialog(tool)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(tool.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          上一页
        </Button>
        <div className="text-sm text-muted-foreground">
          第 {page} 页 / 共 {totalPages} 页
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          下一页
        </Button>
      </div>

      <ToolDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        initialData={selectedTool}
        onSuccess={() => router.refresh()}
        categories={categories}
      />
    </div>
  );
}
