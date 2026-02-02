
import { LucideIcon, LayoutDashboard, Airplay, Settings, FileText, Users, Shield, Activity, Briefcase, Layers, Coffee, BookOpen, Tag, MessageSquare, Link, Mail } from "lucide-react";

export type MenuType = "CATALOG" | "MENU" | "BUTTON";

export interface AdminRoute {
  name: string; // 菜单名称
  path: string; // 路由地址
  icon?: LucideIcon; // 菜单图标
  type: MenuType; // 菜单类型：目录 | 菜单 | 按钮
  sort: number; // 显示排序
  visible: boolean; // 显示状态
  status: "NORMAL" | "DISABLED"; // 菜单状态
  isExternal: boolean; // 是否外链
  children?: AdminRoute[]; // 子菜单
}

export const adminRoutes: AdminRoute[] = [
  {
    name: "主页",
    path: "/dashboard",
    type: "CATALOG",
    sort: 1,
    visible: true,
    status: "NORMAL",
    isExternal: false,
    children: [
      {
        name: "概览",
        path: "/dashboard/overview",
        icon: LayoutDashboard,
        type: "MENU",
        sort: 1,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
    ]
  },
  {
    name: "博客管理",
    path: "/dashboard/blog",
    type: "CATALOG",
    icon: Airplay,
    sort: 2,
    visible: true,
    status: "NORMAL",
    isExternal: false,
    children: [
      {
        name: "文章管理",
        path: "/dashboard/posts",
        icon: BookOpen,
        type: "MENU",
        sort: 1,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
      {
        name: "分类管理",
        path: "/dashboard/categories",
        icon: Tag,
        type: "MENU",
        sort: 2,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
      {
        name: "评论管理",
        path: "/dashboard/comments",
        icon: MessageSquare,
        type: "MENU",
        sort: 3,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
      
    ]
  },

  {
        name: "友链管理",
        path: "/dashboard/friend-links",
        icon: Link,
        type: "MENU",
        sort: 4,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
      {
        name: "AI 工具管理",
        path: "/dashboard/ai-tools",
        icon: Tag,
        type: "MENU",
        sort: 5,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
      {
        name: "工具箱管理",
        path: "/dashboard/tools",
        icon: Briefcase,
        type: "MENU",
        sort: 6,
        visible: true,
        status: "NORMAL",
        isExternal: false,
      },
  {
    name: "用户管理",
    path: "/dashboard/users",
    icon: Users,
    type: "MENU",
    sort: 4,
    visible: true,
    status: "NORMAL",
    isExternal: false,
  },
  {
    name: "邮件管理",
    path: "/dashboard/email-logs",
    icon: Mail,
    type: "MENU",
    sort: 8,
    visible: true,
    status: "NORMAL",
    isExternal: false,
  }
  // {
  //   name: "管理",
  //   path: "/admin-manage",
  //   type: "CATALOG",
  //   icon: Settings,
  //   sort: 5,
  //   visible: true,
  //   status: "NORMAL",
  //   isExternal: false,
  //   children: [
  //     {
  //       name: "系统管理",
  //       path: "/dashboard/system",
  //       icon: Settings,
  //       type: "CATALOG",
  //       sort: 1,
  //       visible: true,
  //       status: "NORMAL",
  //       isExternal: false,
  //       children: [
  //         {
  //           name: "权限验证",
  //           path: "/dashboard/auth",
  //           icon: Shield,
  //           type: "MENU",
  //           sort: 2,
  //           visible: true,
  //           status: "NORMAL",
  //           isExternal: false,
  //         },
  //       ]
  //     },
  //     {
  //       name: "项目",
  //       path: "/dashboard/projects",
  //       icon: Layers,
  //       type: "MENU",
  //       sort: 2,
  //       visible: true,
  //       status: "NORMAL",
  //       isExternal: false,
  //     },
  //     {
  //       name: "关于",
  //       path: "/dashboard/about",
  //       icon: FileText,
  //       type: "MENU",
  //       sort: 3,
  //       visible: true,
  //       status: "NORMAL",
  //       isExternal: false,
  //     }
  //   ]
  // }
];
