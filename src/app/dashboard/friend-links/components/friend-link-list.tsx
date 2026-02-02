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
import { FriendLinkDialog } from "./friend-link-dialog";
import { deleteFriendLink, approveFriendLink, rejectFriendLink } from "../actions";
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

interface FriendLinkListProps {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { useLoadingStore } from "@/store/loading-store";

export function FriendLinkList({ data, total, page, totalPages }: FriendLinkListProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<any>(null);

  const openCreateDialog = () => {
    setSelectedLink(null);
    setDialogOpen(true);
  };

  const openEditDialog = (link: any) => {
    setSelectedLink(link);
    setDialogOpen(true);
  };

  const handleDeleteClick = (link: any) => {
    setLinkToDelete(link);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;
    startLoading();
    try {
      await deleteFriendLink(linkToDelete.id);
      toast.success("友链已删除");
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
      // 创建一个模拟的Request对象来传递headers
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for' || name === 'x-real-ip') {
              return '127.0.0.1'; // 本地开发环境使用localhost IP
            }
            return null;
          }
        }
      } as unknown as Request;
      
      await approveFriendLink(id, mockRequest);
      toast.success("已审核通过");
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handleReject = async (id: string) => {
    startLoading();
    try {
      await rejectFriendLink(id);
      toast.success("已拒绝申请");
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      stopLoading();
    }
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/friend-links?page=${newPage}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> 新增友链
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>链接</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>申请时间</TableHead>
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
              data.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {link.logo && (
                        <img src={link.logo} alt={link.name} className="h-6 w-6 rounded-full object-cover" />
                      )}
                      {link.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-blue-500">
                      {link.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {link.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.status === "APPROVED" ? "default" : link.status === "REJECTED" ? "destructive" : "secondary"}>
                      {link.status === "APPROVED" ? "已通过" : link.status === "REJECTED" ? "已拒绝" : "待审核"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(link.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {link.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleApprove(link.id)}
                            title="通过"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => handleReject(link.id)}
                            title="拒绝"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(link)}
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(link)}
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

      <FriendLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        friendLink={selectedLink}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除友链 <b>{linkToDelete?.name}</b>。
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
