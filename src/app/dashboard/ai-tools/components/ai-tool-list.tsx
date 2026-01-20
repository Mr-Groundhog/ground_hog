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
import { Plus, Pencil, Trash2, Check, X, ExternalLink } from "lucide-react";
import { AiToolDialog } from "./ai-tool-dialog";
import { deleteAiTool, approveAiTool, rejectAiTool } from "../actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface AiToolListProps {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { useLoadingStore } from "@/store/loading-store";

export function AiToolList({ data, total, page, totalPages }: AiToolListProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const openCreateDialog = () => {
    setSelectedTool(null);
    setDialogOpen(true);
  };

  const openEditDialog = (tool: any) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  };

  const handleDeleteClick = (tool: any) => {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    startLoading();
    try {
      await deleteAiTool(toolToDelete.id);
      toast.success("删除成功");
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    } finally {
      stopLoading();
    }
  };

  const handleApprove = async (id: string) => {
    startLoading();
    try {
      await approveAiTool(id);
      toast.success("已通过");
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleReject = async (id: string) => {
    startLoading();
    try {
      await rejectAiTool(id);
      toast.success("已拒绝");
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/dashboard/ai-tools?${params.toString()}`);
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
      router.push(`/dashboard/ai-tools?${params.toString()}`);
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
              <TableHead>标签</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tool.icon && (
                        <img src={tool.icon} alt={tool.name} className="h-6 w-6 rounded-sm object-cover" />
                      )}
                      <div className="flex flex-col">
                        <span>{tool.name}</span>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                          {new URL(tool.url).hostname} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {tool.tags?.split(/[,，]/).filter(Boolean).map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-muted-foreground bg-secondary px-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.status === "APPROVED" ? "default" : tool.status === "REJECTED" ? "destructive" : "secondary"}>
                      {tool.status === "APPROVED" ? "已通过" : tool.status === "REJECTED" ? "已拒绝" : "待审核"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(tool.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {tool.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleApprove(tool.id)}
                            title="通过"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => handleReject(tool.id)}
                            title="拒绝"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(tool)}
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(tool)}
                        title="删除"
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
        <div className="flex-1 text-sm text-muted-foreground">
          共 {total} 条记录
        </div>
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

      <AiToolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        aiTool={selectedTool}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除 <b>{toolToDelete?.name}</b>。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
