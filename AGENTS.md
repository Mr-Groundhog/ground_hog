# Ground Hog 项目文档

## 项目概述

Ground Hog（my-tool-platform）是一个基于 Next.js 的多功能工具平台和博客系统，采用现代 Web 技术栈构建。该项目集成了用户认证、博客管理、AI 工具库、实用工具箱等功能，为用户提供一站式的工具和内容管理服务。

### 核心特性

- **用户系统**: 完整的用户注册、登录、权限管理（USER/ADMIN 角色）
- **博客管理**: 文章发布、分类、标签、评论系统
- **AI 工具库**: AI 工具的收集、审核和展示
- **实用工具箱**: Base64 转换、二维码生成、抽奖等在线工具
- **友链管理**: 友情链接的审核和管理
- **数据分析**: 网站访问统计和用户行为追踪
- **响应式设计**: 深色主题，移动端适配

### 技术栈

- **框架**: Next.js 16.1.4 (App Router)
- **语言**: TypeScript 5
- **UI 组件**: Radix UI + Tailwind CSS 4
- **数据库**: PostgreSQL (使用 Prisma ORM)
- **缓存**: Redis (ioredis)
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **表单**: React Hook Form + Zod 验证
- **认证**: JWT + Argon2 密码哈希
- **编辑器**: @uiw/react-md-editor (Markdown 编辑器)
- **主题**: next-themes (支持深色/浅色模式)

## 项目结构

```
ground_hog/
├── prisma/                    # 数据库相关
│   ├── schema.prisma         # Prisma 数据模型定义
│   └── migrations/           # 数据库迁移文件
├── public/                    # 静态资源
│   └── static/logo/          # Logo 图片
├── scripts/                   # 工具脚本
│   ├── diagnose-db.ts        # 数据库诊断脚本
│   └── test-*.ts             # 各种测试脚本
└── src/
    ├── app/                   # Next.js App Router 页面
    │   ├── (auth)/          # 认证相关页面（登录、注册）
    │   ├── (site)/          # 前台页面
    │   ├── dashboard/       # 管理后台
    │   ├── editor/          # 文章编辑器
    │   └── api/             # API 路由
    ├── components/           # React 组件
    │   ├── admin/          # 后台管理组件
    │   ├── blog/           # 博客相关组件
    │   ├── tools/          # 工具组件
    │   ├── ui/             # UI 基础组件
    │   └── providers/      # 上下文提供者
    ├── config/              # 配置文件
    │   └── admin-menu.ts   # 后台菜单配置
    ├── hooks/               # 自定义 Hooks
    ├── lib/                 # 工具库
    │   ├── auth.ts         # 认证相关
    │   ├── db.ts           # 数据库连接
    │   ├── redis.ts        # Redis 连接
    │   └── token.ts        # Token 处理
    └── store/              # 状态管理
        ├── user-store.ts   # 用户状态
        └── loading-store.ts # 加载状态
```

## 环境配置

项目需要配置以下环境变量（创建 `.env` 文件）：

```env
# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Redis 连接（可选）
REDIS_URL="redis://localhost:6379"

# JWT 密钥
JWT_SECRET="your-jwt-secret-key"

# 应用端口（可选，默认 9527）
PORT=9527
```

## 构建和运行

### 开发环境

```bash
# 安装依赖（使用 pnpm）
pnpm install

# 启动开发服务器（运行在 9527 端口）
pnpm dev

# 访问 http://localhost:9527
```

### 数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 打开 Prisma Studio（数据库可视化工具）
npx prisma studio
```

### 生产构建

```bash
# 构建项目
pnpm build

# 启动生产服务器（运行在 9526 端口）
pnpm start
```

### 其他命令

```bash
# 代码检查
pnpm lint
```

## 开发规范

### 代码风格

- 使用 TypeScript 进行类型定义
- 采用 ES6+ 语法特性
- 使用 Prettier 进行代码格式化（通过 ESLint 集成）
- 组件命名使用 PascalCase
- 文件名使用 kebab-case 或 camelCase

### 路由结构

- 使用 Next.js App Router
- 路由分组：`(auth)`、`(site)`、`dashboard` 等
- API 路由位于 `app/api/` 目录下
- 动态路由使用 `[id]` 语法

### 状态管理

- 全局状态使用 Zustand（用户信息、加载状态）
- 服务器状态使用 TanStack Query（数据获取和缓存）
- 本地组件状态使用 React Hooks

### 数据库操作

- 使用 Prisma ORM 进行数据库操作
- 数据库连接配置在 `src/lib/db.ts`
- 数据模型定义在 `prisma/schema.prisma`
- 使用 `@map` 指定数据库字段名（snake_case）

### 认证和授权

- 使用 JWT 进行用户认证
- 密码使用 Argon2 进行哈希存储
- 中间件保护管理后台路由（`src/middleware.ts`）
- Token 存储在 HTTP-only Cookie 中

### UI 组件开发

- 使用 Radix UI 作为基础组件库
- 使用 Tailwind CSS 进行样式开发
- 遵循 Material Design 设计原则
- 所有 UI 组件位于 `src/components/ui/`

### 错误处理

- 生产环境构建时忽略 ESLint 和 TypeScript 错误（见 `next.config.ts`）
- 使用 Sonner 进行 Toast 通知
- 使用 try-catch 处理异步操作错误

### 代码注释

- 添加必要的代码注释，解释复杂逻辑
- 使用 JSDoc 风格的注释（特别是在函数和复杂类型上）
- 数据库模型字段添加 Prisma 注释（`///`）

## 主要功能模块

### 1. 用户认证

- 位置: `src/app/(auth)/`、`src/lib/auth.ts`
- 功能: 用户注册、登录、密码加密
- 路由: `/login`、`/register`

### 2. 博客系统

- 位置: `src/app/dashboard/posts/`、`src/app/editor/`
- 功能: 文章管理、分类管理、评论管理
- Markdown 编辑器: @uiw/react-md-editor
- 支持文章的点赞、收藏交互

### 3. 管理后台

- 位置: `src/app/dashboard/`
- 入口: `/dashboard`（需 ADMIN 角色）
- 菜单配置: `src/config/admin-menu.ts`
- 模块: 概览、文章、分类、评论、友链、AI 工具、工具箱、用户

### 4. 实用工具

- 位置: `src/components/tools/`、`src/app/(site)/tools/`
- 功能:
  - Base64 转换器
  - 二维码生成器
  - 抽奖工具
  - JSON 工具
  - 其他实用工具

### 5. AI 工具库

- 位置: `src/app/dashboard/ai-tools/`、`src/app/(site)/ai-platform/`
- 功能: AI 工具的收录、审核、展示

### 6. 友链管理

- 位置: `src/app/dashboard/friend-links/`
- 功能: 友情链接的提交、审核、展示

### 7. 数据统计

- 位置: `src/lib/redis.ts`、`src/components/analytics-tracker.tsx`
- 功能: 网站访问量统计、用户行为追踪

## 特殊注意事项

1. **端口配置**: 开发环境使用 9527 端口，生产环境使用 9526 端口
2. **构建配置**: 生产构建会忽略 ESLint 和 TypeScript 错误
3. **数据库**: 当前使用 PostgreSQL，支持软删除（isDelete 字段）
4. **缓存**: 可选使用 Redis 进行缓存，配置在 `src/lib/redis.ts`
5. **深色模式**: 默认启用深色主题（在 RootLayout 中设置）
6. **图标库**: 使用 Lucide React 作为图标库
7. **字体**: 使用 Geist 和 Geist_Mono 字体
8. **表单验证**: 使用 Zod 进行表单验证
9. **图片**: Logo 位于 `public/static/logo/hog.png`

## 测试

项目包含多个测试脚本用于数据库诊断：
- `scripts/diagnose-db.ts` - 数据库诊断
- `scripts/test-prisma-simplified.ts` - Prisma 简化测试
- `scripts/test-prisma-standard.ts` - Prisma 标准测试

## 部署建议

1. 使用 Vercel 进行部署（Next.js 官方推荐）
2. 配置生产环境的环境变量
3. 确保数据库和 Redis 可访问
4. 运行数据库迁移: `npx prisma migrate deploy`
5. 构建: `pnpm build`
6. 启动: `pnpm start`

## 开发工作流

1. 从 `dev` 分支创建功能分支
2. 开发功能并提交代码
3. 运行 `pnpm lint` 检查代码
4. 测试功能是否正常
5. 提交 PR 并请求代码审查
6. 合并到主分支

## 依赖管理

- 使用 pnpm 作为包管理器
- 依赖文件: `package.json`、`pnpm-lock.yaml`
- 工作区配置: `pnpm-workspace.yaml`

## 相关链接

- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
- Radix UI: https://www.radix-ui.com/
- Tailwind CSS: https://tailwindcss.com/docs