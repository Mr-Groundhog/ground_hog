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
import { Plus, Pencil, Trash2, Check, X, Eye, Zap, Heart, MessageSquare, CheckCheck, XCircle, BarChart3 } from "lucide-react";
import { PROMPT_CATEGORIES } from "@/config/prompt-categories";
import { PromptTemplateDialog } from "./prompt-template-dialog";
import { deletePromptTemplate, approvePromptTemplate, rejectPromptTemplate, batchApprovePromptTemplates, batchRejectPromptTemplates, batchDeletePromptTemplates } from "../actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useLoadingStore } from "@/store/loading-store";

interface PromptTemplateListProps {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: { total: number; pending: number; approved: number; rejected: number };
}

export function PromptTemplateList({ data, total, page, totalPages, stats }: PromptTemplateListProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleDeleteClick = (template: any) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    startLoading();
    try {
      await deletePromptTemplate(templateToDelete.id);
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
      await approvePromptTemplate(id);
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
      await rejectPromptTemplate(id);
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
    router.push(`/dashboard/prompt-templates?${params.toString()}`);
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
      router.push(`/dashboard/prompt-templates?${params.toString()}`);
    }
  };

  // 批量选择
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    startLoading();
    try {
      await batchApprovePromptTemplates(Array.from(selectedIds));
      toast.success(`已批量通过 ${selectedIds.size} 条`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.size === 0) return;
    startLoading();
    try {
      await batchRejectPromptTemplates(Array.from(selectedIds));
      toast.success(`已批量拒绝 ${selectedIds.size} 条`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    startLoading();
    try {
      await batchDeletePromptTemplates(Array.from(selectedIds));
      toast.success(`已批量删除 ${selectedIds.size} 条`);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const pendingCount = stats.pending;

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <BarChart3 className="h-3.5 w-3.5" />
            全部模板
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-zinc-950 p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            待审核
          </div>
          <div className="text-2xl font-bold text-amber-300">{stats.pending}</div>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-gradient-to-b from-green-500/5 to-zinc-950 p-4">
          <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
            <Check className="h-3.5 w-3.5" />
            已通过
          </div>
          <div className="text-2xl font-bold text-green-300">{stats.approved}</div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-gradient-to-b from-red-500/5 to-zinc-950 p-4">
          <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
            <X className="h-3.5 w-3.5" />
            已拒绝
          </div>
          <div className="text-2xl font-bold text-red-300">{stats.rejected}</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input 
            placeholder="搜索模板..." 
            className="max-w-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              const params = new URLSearchParams(window.location.search);
              if (e.target.value) params.set("status", e.target.value);
              else params.delete("status");
              params.set("page", "1");
              router.push(`/dashboard/prompt-templates?${params.toString()}`);
            }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待审核{pendingCount > 0 ? ` (${pendingCount})` : ""}</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已拒绝</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              const params = new URLSearchParams(window.location.search);
              if (e.target.value) params.set("category", e.target.value);
              else params.delete("category");
              params.set("page", "1");
              router.push(`/dashboard/prompt-templates?${params.toString()}`);
            }}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">全部分类</option>
            {PROMPT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> 新增模板
        </Button>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <span className="text-sm text-purple-300">已选 {selectedIds.size} 项</span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300" onClick={handleBatchApprove}>
            <Check className="mr-1 h-3 w-3" /> 批量通过
          </Button>
          <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300" onClick={handleBatchReject}>
            <X className="mr-1 h-3 w-3" /> 批量拒绝
          </Button>
          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleBatchDelete}>
            <Trash2 className="mr-1 h-3 w-3" /> 批量删除
          </Button>
          <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setSelectedIds(new Set())}>
            取消选择
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-purple-500/20"
                />
              </TableHead>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>数据</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 text-zinc-700" />
                    <span>暂无数据</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((template) => (
                <TableRow key={template.id} className={selectedIds.has(template.id) ? "bg-purple-500/5" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(template.id)}
                      onChange={() => toggleSelect(template.id)}
                      className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-purple-500/20"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="cursor-pointer hover:text-primary" onClick={() => setPreviewTemplate(template)}>{template.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {template.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title="浏览">
                        <Eye className="h-3 w-3" />{template.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="点赞">
                        <Heart className="h-3 w-3" />{template.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="使用">
                        <Zap className="h-3 w-3" />{template.useCount || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.status === "APPROVED" ? "default" : template.status === "REJECTED" ? "destructive" : "secondary"}>
                      {template.status === "APPROVED" ? "已通过" : template.status === "REJECTED" ? "已拒绝" : "待审核"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {template.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleApprove(template.id)}
                            title="通过"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => handleReject(template.id)}
                            title="拒绝"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(template)}
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(template)}
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

      <PromptTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除 <b>{templateToDelete?.title}</b>。
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

      {/* 内容预览弹窗 */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{previewTemplate.category}</Badge>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {previewTemplate.viewCount || 0}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {previewTemplate.likeCount || 0}</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {previewTemplate.useCount || 0}</span>
              </div>
              <div className="rounded-md bg-muted p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">{previewTemplate.content}</pre>
              </div>
              {previewTemplate.tags && (
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.tags.split(/[,，]/).filter(Boolean).map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
