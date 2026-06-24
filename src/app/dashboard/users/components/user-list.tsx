"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, Edit, Lock, Unlock, Trash2, Plus, Search } from "lucide-react";
import { UserDialog } from "./user-dialog";
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
import { deleteUser, toggleUserStatus } from "../actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserListUser {
  id: string;
  username: string;
  email: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string | Date;
  avatar: string | null;
  bio: string | null;
}

interface UserListProps {
  data: UserListUser[];
  page: number;
  totalPages: number;
  total: number;
}

import { useLoadingStore } from "@/store/loading-store";

export function UserList({ data, page, totalPages, total }: UserListProps) {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedUser, setSelectedUser] = useState<UserListUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserListUser | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserListUser) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const openViewDialog = (user: UserListUser) => {
    setDialogMode("view");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user: UserListUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    startLoading();
    try {
      await deleteUser(userToDelete.id);
      toast.success("用户已删除");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("删除失败");
    } finally {
      stopLoading();
    }
  };

  const handleToggleStatus = async (user: UserListUser) => {
    startLoading();
    try {
      await toggleUserStatus(user.id, !user.isActive);
      toast.success(user.isActive ? "用户已冻结" : "用户已解冻");
    } catch {
      toast.error("操作失败");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索用户名/邮箱/昵称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetSearch}>
            重置
          </Button>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> 新增用户
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
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
              data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.role === "ADMIN" ? "管理员" : "普通用户"}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}>
                      {user.isActive ? "正常" : "冻结"}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(user)} title="查看详情">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="编辑">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleStatus(user)} 
                        title={user.isActive ? "冻结账号" : "解冻账号"}
                        className={user.isActive ? "text-orange-500 hover:text-orange-600" : "text-green-500 hover:text-green-600"}
                      >
                        {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(user)} title="删除">
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        user={selectedUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除用户 <b>{userToDelete?.username}</b>。此操作无法撤销（软删除）。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
