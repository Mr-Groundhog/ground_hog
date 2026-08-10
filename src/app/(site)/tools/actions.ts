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
  {
    id: "local-music",
    name: "本地音乐台",
    description: "本地音乐播放器，支持播放本地音频文件",
    icon: "Music",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/music",
    category: "娱乐工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "local-variable-naming",
    name: "变量命名工具",
    description: "输入中文/英文描述，一键生成 46 种程序员常用变量命名格式",
    icon: "Code2",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/variable-naming",
    category: "开发工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "local-docker-compose",
    name: "Docker Compose 生成器",
    description: "勾选需要的服务（Redis、PostgreSQL、Nginx 等），自动生成带注释的 compose.yml",
    icon: "Container",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/docker-compose",
    category: "开发工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "local-auth-to-cpa",
    name: "auth转cpa",
    description: "纯前端工具，将 ChatGPT Web session JSON 转换为 CPA、sub2api、Codex、AxonHub 格式。",
    icon: "KeyRound",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/auth-to-cpa",
    category: "开发工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "local-ip-query",
    name: "IP 地址查询",
    description: "查询当前 IP 或指定 IP 的地理位置、运营商、ASN 等信息",
    icon: "Globe",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/ip-query",
    category: "网络工具",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "local-credit-draw",
    name: "共建公益",
    description: "留下你的建议或使用记录，可参与平台额度码抽取，并申请共建公益站。",
    icon: "HandHeart",
    version: "v1.0.0",
    status: "NORMAL" as const,
    type: "LOCAL" as const,
    url: "/tools/credit-draw",
    category: "公益工具",
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
