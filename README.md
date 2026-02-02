# Ground Hog - 多功能工具平台

一个基于 Next.js 的现代化工具平台和博客系统，集成了用户认证、博客管理、AI 工具库、实用工具箱等功能。

## 🚀 核心特性

- **用户系统**: 完整的用户注册、登录、权限管理（USER/ADMIN 角色）
- **博客管理**: 文章发布、分类、标签、评论系统
- **AI 工具库**: AI 工具的收集、审核和展示
- **实用工具箱**: Base64 转换、二维码生成、抽奖等在线工具
- **友链管理**: 友情链接的审核和管理
- **邮件系统**: Gmail 邮件发送（验证码、通知、自定义邮件）
- **数据分析**: 网站访问统计和用户行为追踪
- **响应式设计**: 深色主题，移动端适配

## 🛠 技术栈

- **框架**: Next.js 16.1.4 (App Router)
- **语言**: TypeScript 5
- **UI 组件**: Radix UI + Tailwind CSS 4
- **数据库**: PostgreSQL (使用 Prisma ORM)
- **缓存**: Redis (ioredis)
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **表单**: React Hook Form + Zod 验证
- **认证**: JWT + Argon2 密码哈希
- **邮件**: Nodemailer + Gmail SMTP

## 📧 邮件功能

本项目已集成 Gmail 邮件发送功能，支持：

- 普通邮件发送
- 验证码邮件模板
- 系统通知邮件模板
- 友链审核通过自动邮件通知

### 特色功能

- **自动邮件通知**：友链审核通过后自动发送邮件通知
- **邮件日志记录**：完整记录每封邮件的发送状态、时间和IP地址
- **IP频率限制**：同一IP每小时最多发送3封邮件，防止滥用
- **失败重试机制**：可在邮件日志页面重试发送失败的邮件

### 管理页面

- **邮件日志**：`/dashboard/email-logs` - 查看所有邮件发送记录
- **测试页面**：`/dashboard/test-friend-email` - 测试友链邮件发送功能

详细使用指南请查看 [MAILER_GUIDE.md](./MAILER_GUIDE.md)

测试页面：[/mail-test](http://localhost:9527/mail-test)

## 🏗 项目结构

```
ground_hog/
├── prisma/                    # 数据库相关
├── public/                    # 静态资源
├── scripts/                   # 工具脚本
├── src/
│   ├── app/                   # Next.js App Router 页面
│   ├── components/            # React 组件
│   ├── config/                # 配置文件
│   ├── hooks/                 # 自定义 Hooks
│   ├── lib/                   # 工具库
│   └── store/                 # 状态管理
└── .env.example              # 环境变量模板
```

## ⚙ 环境配置

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，配置必要信息：
   ```env
   # Gmail 邮件配置
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   
   # 数据库配置
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   
   # JWT 密钥
   JWT_SECRET=your-jwt-secret-key
   ```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:9527
```

## 📚 更多文档

- [邮件功能使用指南](./MAILER_GUIDE.md)
- [项目详细文档](./AGENTS.md)

## 🧪 测试邮件功能

```bash
# 运行邮件测试脚本
npx tsx scripts/test-mailer.ts
```

## 📝 开发规范

- 使用 TypeScript 进行类型定义
- 采用 Prettier 进行代码格式化
- 组件命名使用 PascalCase
- 文件名使用 kebab-case

## 📄 License

MIT License
