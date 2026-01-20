# 后台侧边栏实现计划

确认项目已包含 shadcn 的 `sidebar` 组件，将基于此组件重构后台侧边栏。

## 1. 创建 AppSidebar 组件
创建文件 `src/components/admin/app-sidebar.tsx`，实现以下功能：
- **数据驱动**：读取 `src/config/admin-menu.ts` 中的 `adminRoutes` 配置。
- **业务逻辑**：
  - 递归渲染多级菜单。
  - 自动处理“目录若只有一个子项则显示为菜单”的逻辑。
  - 自动高亮当前激活的路由。
- **UI 结构**：
  - **Header**：显示 Logo 和项目名称。
  - **Content**：使用 `SidebarMenu` 和 `Collapsible` 展示菜单树。
  - **Footer**：显示版本信息。

## 2. 更新后台布局
修改 `src/app/dashboard/layout.tsx`：
- 引入 `SidebarProvider` 和 `SidebarInset`。
- 替换原有的 Flex 左右布局，使用 Shadcn Sidebar 的标准布局结构。
- 移除原本手动引用的 `AdminSidebar`。

## 3. 更新顶部 Header
修改 `src/components/admin/header.tsx`：
- 引入 `SidebarTrigger` 组件，添加控制侧边栏展开/折叠的按钮。
- 添加分割线优化视觉效果。

## 4. 验证
- 检查侧边栏展开/折叠功能。
- 检查路由跳转和高亮是否正确。
- 检查移动端适配效果。