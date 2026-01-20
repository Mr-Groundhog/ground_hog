
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// 模拟数据
const records = [
  {
    id: "REC001",
    date: "2024-01-18",
    category: "餐饮",
    content: "午餐 - 汉堡王",
    amount: "¥35.00",
    status: "已完成",
  },
  {
    id: "REC002",
    date: "2024-01-18",
    category: "交通",
    content: "地铁通勤",
    amount: "¥5.00",
    status: "已完成",
  },
  {
    id: "REC003",
    date: "2024-01-17",
    category: "购物",
    content: "超市采购",
    amount: "¥128.50",
    status: "已完成",
  },
  {
    id: "REC004",
    date: "2024-01-17",
    category: "娱乐",
    content: "电影票",
    amount: "¥45.00",
    status: "已完成",
  },
  {
    id: "REC005",
    date: "2024-01-16",
    category: "餐饮",
    content: "晚餐 - 火锅",
    amount: "¥210.00",
    status: "已完成",
  },
];

export default function LifeRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">生活记录管理</h2>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> 新增记录
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            {/* <TableCaption>最近的生活消费与活动记录</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">编号</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>{record.content}</TableCell>
                  <TableCell className="text-right">{record.amount}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
