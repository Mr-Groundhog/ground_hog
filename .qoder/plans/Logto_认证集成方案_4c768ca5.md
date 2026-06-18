# Logto 认证集成方案

## 当前认证体系分析

现有认证模块：
- **前台登录**: `src/app/(auth)/login/` - 账号密码 + 邮箱验证码登录
- **前台注册**: `src/app/(auth)/register/` - 用户名+邮箱+密码注册
- **后台登录**: `src/app/admin/login/` - 管理员独立登录
- **API 路由**: `src/app/api/auth/` (login, register, email-login, send-code)
- **认证工具**: `src/lib/auth.ts` (argon2), `src/lib/token.ts` (JWT), `src/lib/session.ts`, `src/lib/cookies.ts`
- **中间件**: `src/middleware.ts` - 基于 JWT 的 dashboard/admin 路由保护
- **状态管理**: `src/store/user-store.ts` - Zustand 用户状态

## 你需要提供的信息

在开始实施之前，请准备以下 Logto Cloud 配置信息：

| 信息 | 说明 | 获取方式 |
|---|---|---|
| **Logto Endpoint** | 你的 Logto Cloud 端点地址 | Logto Cloud 控制台 -> Settings，格式如 `https://xxx.logto.app` |
| **App ID** | 应用标识 | 创建应用后自动生成 |
| **App Secret** | 应用密钥 | 应用详情页可查看 |
| **Cookie Secret** | 至少 32 位的随机字符串，用于加密会话 cookie | 自行生成，如 `openssl rand -base64 32` |

---

## Logto 后台配置指南

### 1. 注册 Logto Cloud
- 访问 https://cloud.logto.io 注册账号
- 创建一个 Tenant（租户）

### 2. 创建应用
- 进入控制台 -> **Applications** -> **Create Application**
- 选择 **Traditional web app**（传统 Web 应用，因为 Next.js 有服务端路由）
- 填写应用名称，如 `Ground Hog`

### 3. 配置 Redirect URI
在应用详情页 -> **Redirect URIs** 添加：
```
http://localhost:9527/api/logto/callback
```
生产环境追加：
```
https://your-domain.com/api/logto/callback
```

### 4. 配置 Post Sign-out Redirect URI
在应用详情页 -> **Post sign-out redirect URIs** 添加：
```
http://localhost:9527
```
生产环境追加：
```
https://your-domain.com
```

### 5. 配置登录方式
- 控制台 -> **Sign-in experience** -> **Sign-in methods**
- 开启需要的登录方式：邮箱+密码、手机号、社交登录（Google、GitHub 等）
- 开启 **Create new account if not exists**（自动注册）

### 6. 配置管理员角色 (RBAC)
- 控制台 -> **Roles** -> **Create role**
- 创建 `ADMIN` 角色，类型选 **User**
- 创建 `USER` 角色（默认角色）
- 在用户管理中，将你的账号分配 `ADMIN` 角色

### 7. 记录配置信息
从应用详情页复制以下信息填入 `.env`：
```env
LOGTO_ENDPOINT=https://xxx.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_COOKIE_SECRET=at_least_32_characters_long_random_string
LOGTO_BASE_URL=http://localhost:9527
```

---

## 实施任务

### Task 1: 安装 Logto SDK
```bash
pnpm add @logto/next
```

### Task 2: 添加环境变量
在 `.env` 中添加 Logto 相关配置：
```env
LOGTO_ENDPOINT=https://xxx.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_COOKIE_SECRET=your-cookie-secret-at-least-32-chars
LOGTO_BASE_URL=http://localhost:9527
```

### Task 3: 创建 Logto 配置模块
新建 `src/lib/logto.ts`，导出 Logto 配置和客户端实例：
```ts
import { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  endpoint: process.env.LOGTO_ENDPOINT!,
  baseUrl: process.env.LOGTO_BASE_URL!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  cookieSecure: process.env.NODE_ENV === 'production',
};
```

### Task 4: 创建 Logto API 路由
创建 3 个 API 路由处理认证流程：

- `src/app/api/logto/sign-in/route.ts` - 发起登录（重定向到 Logto）
- `src/app/api/logto/callback/route.ts` - 处理回调（交换 token）
- `src/app/api/logto/sign-out/route.ts` - 登出

这些路由使用 `@logto/next` 提供的 `handleSignIn`、`handleSignInCallback`、`handleSignOut` 方法。

### Task 5: 创建用户同步 API
新建 `src/app/api/logto/sync-user/route.ts`：
- Logto 登录成功后，调用此 API 将用户信息同步到本地 User 表
- 通过 Logto 的 `sub`（用户 ID）关联 Account 表（已有 model）
- 首次登录自动创建本地 User 记录，后续登录更新信息

### Task 6: 重写中间件
改造 `src/middleware.ts`：
- 移除现有基于 JWT 的 `admin-token` cookie 验证
- 使用 Logto session 验证登录状态
- dashboard 路由：要求登录 + ADMIN 角色
- 普通受保护路由：仅要求登录

### Task 7: 重写 session 工具
改造 `src/lib/session.ts`：
- `getCurrentUser()` 改为从 Logto session 获取用户信息
- 通过 Logto 的 `sub` 查找本地 User 表获取完整用户数据
- 返回包含角色信息的 CurrentUser

### Task 8: 改造前台登录/注册页面
- 移除 `src/app/(auth)/login/` 和 `src/app/(auth)/register/` 下的自建表单
- 改为一个简单的登录引导页，提供「登录」按钮跳转到 `/api/logto/sign-in`
- 或者直接移除 `(auth)` 路由组，登录按钮放在导航栏，点击直接跳转到 Logto

### Task 9: 改造后台登录页面
- 移除 `src/app/admin/login/` 中的自建密码登录表单
- 改为跳转到 Logto 统一登录，或保留一个「Logto 登录」按钮

### Task 10: 更新 user-store
改造 `src/store/user-store.ts`：
- 移除原有的 `login(user, token)` 方法（不再手动管理 JWT cookie）
- 改为从 API 获取当前登录状态和用户信息
- `logout` 改为调用 `/api/logto/sign-out`

### Task 11: 移除旧认证相关代码
- 删除 `src/app/api/auth/` 下所有旧 API 路由（login, register, email-login, send-code）
- 删除 `src/lib/auth.ts`（argon2 密码哈希，不再需要）
- 删除 `src/lib/token.ts`（JWT 签发验证，不再需要）
- 删除 `src/lib/cookies.ts`（手动 cookie 管理，不再需要）
- 删除 `src/app/(auth)/safe-redirect.ts`
- 可选移除 `argon2`、`jsonwebtoken`、`js-cookie` 依赖

### Task 12: 更新导航栏登录/登出交互
- 登录按钮：`<a href="/api/logto/sign-in">` 发起登录
- 登出按钮：`<a href="/api/logto/sign-out">` 登出
- 已登录状态：显示用户头像/昵称

### Task 13: 数据库迁移
- User 表添加 `logtoId` 字段（存储 Logto 的 `sub`），用于关联 Logto 用户
- 或复用现有 Account 表的 `providerAccountId` 字段（已有 Account model）
- 推荐方案：利用现有 Account 表，provider 设为 `logto`

### Task 14: 验证与测试
- 测试完整登录流程：点击登录 -> Logto 页面 -> 回调 -> 本地用户同步
- 测试后台访问保护：未登录访问 /dashboard -> 跳转 Logto 登录
- 测试角色权限：非 ADMIN 用户访问 /dashboard -> 拒绝
- 测试登出：登出后清除 session

---

## 整体架构变化

```
[变更前]
用户 -> 自建登录表单 -> /api/auth/login -> JWT -> Cookie(admin-token) -> middleware 验证

[变更后]
用户 -> Logto 登录页 -> /api/logto/callback -> Logto Session -> middleware 验证
                                                                    |
                                                              同步本地 User 表
                                                              (通过 Account 表关联)
```

## 关键决策

1. **用户关联策略**: 复用现有 `Account` model，`provider="logto"`，`providerAccountId=Logto sub`，避免新增数据库字段
2. **管理员判断**: 通过 Logto RBAC 角色 + 本地 User 表的 `role` 字段双重校验
3. **Session 管理**: 完全由 `@logto/next` 的 cookie-based session 处理，不再手动管理 JWT cookie
4. **前台注册入口**: 移除独立注册页面，注册由 Logto 登录页面的「自动创建账号」功能承接
