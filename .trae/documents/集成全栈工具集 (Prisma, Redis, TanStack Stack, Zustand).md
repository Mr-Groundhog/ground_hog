# 集成 Prisma, Redis, TanStack Query, Zustand, TanStack Table 实施计划

## 目标
在现有 Next.js 项目中集成全套现代全栈开发工具，并实现配置的环境隔离与统一管理。

## 步骤详解

### Phase 1: 依赖安装与环境配置
1.  **安装依赖包**:
    *   后端/数据: `prisma`, `@prisma/client`, `ioredis`
    *   前端/状态: `@tanstack/react-query`, `zustand`, `@tanstack/react-table`
2.  **环境配置**:
    *   创建 `.env` 文件（包含数据库和 Redis 连接字符串）。
    *   *注意：由于没有实际的数据库连接，我将提供标准配置代码，你需要在本地或服务器填入真实 URL。*

### Phase 2: 后端基础设施 (lib/utils)
1.  **Prisma Setup**:
    *   初始化 Prisma (`npx prisma init`).
    *   修改 `prisma/schema.prisma` 设置为 `mysql`。
    *   创建 `src/lib/db.ts`: 封装 PrismaClient 单例，处理开发环境热重载连接问题。
2.  **Redis Setup**:
    *   创建 `src/lib/redis.ts`: 封装 ioredis 客户端，提供统一的配置入口。

### Phase 3: 前端基础设施 (Providers & Stores)
1.  **TanStack Query**:
    *   创建 `src/components/providers/query-provider.tsx`: 配置 QueryClient。
    *   更新 `src/app/layout.tsx`: 接入 Provider。
2.  **Zustand (用户状态)**:
    *   创建 `src/store/user-store.ts`: 实现用户状态管理。
    *   集成 `persist` 中间件：实现用户信息自动缓存到 LocalStorage。

### Phase 4: TanStack Table 集成
1.  确保依赖已安装，准备好在后续业务页面（如用户列表、日志列表）中使用。

## 交付结果
*   配置好的 `src/lib/db.ts` 和 `src/lib/redis.ts`。
*   配置好的全局 `QueryProvider`。
*   可持久化的 `useUserStore` hook。
*   包含 MySQL 配置的 `schema.prisma`。
