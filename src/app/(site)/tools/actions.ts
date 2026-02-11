"use server";

import { prisma } from "@/lib/db";
import { submitToolSchema, SubmitToolFormValues } from "./schema";

// 本地工具列表（硬编码，不存储在数据库）
const LOCAL_TOOLS = [
  {
    id: "local-linux-study",
    name: "Linux 命令学习",
    description: "Linux 命令速查工具，支持模糊搜索、命令示例、一键复制",
    icon: "Terminal",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/linux-study",
    category: "开发工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getPublicTools() {
  const dbTools = await prisma.tool.findMany({
    where: {
      status: {
        not: "PENDING", // Only show non-pending tools to public
      }
    },
    orderBy: { category: "asc" },
  });

  // 合并本地工具和数据库工具
  return [...LOCAL_TOOLS, ...dbTools];
}

export async function submitTool(data: SubmitToolFormValues) {
  const validated = submitToolSchema.parse(data);
  
  await prisma.tool.create({
    data: {
      ...validated,
      status: "PENDING",
      type: "EXTERNAL", // User submissions are external by default
      version: "v1.0.0",
    },
  });
  
  return { success: true };
}
