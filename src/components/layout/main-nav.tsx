"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function MainNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUserStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/tools", label: "工具箱" },
    { href: "/ai-platform", label: "AI 平台" },
    // { href: "/history", label: "个人简历" },
    { href: "/graph", label: "生活随笔" },
    { href: "/friends", label: "友链" },
  ];

  return (
    <div className="flex w-full items-center justify-between px-6 h-16 bg-[#09090b]">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded overflow-hidden">
            <Image
              src="/static/logo/hog.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-mono text-lg font-bold tracking-tighter text-white whitespace-nowrap">
            ground_hog
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "h-9 px-4 text-xs font-medium transition-colors bg-transparent hover:bg-zinc-800/50 hover:text-cyan-400 focus:bg-zinc-800/50 focus:text-cyan-400",
                      isActive ? "text-cyan-400" : "text-zinc-400"
                    )}
                  >
                    <Link href={item.href}>
                      {item.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                      )}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {mounted && isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline-block">
              {user?.username || user?.email}
            </span>
            {user?.role === "ADMIN" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-md text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/50"
                asChild
                title="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50"
              onClick={() => logout()}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="h-9 rounded-md bg-zinc-100 px-4 text-xs font-semibold text-zinc-950 hover:bg-white whitespace-nowrap"
            asChild
          >
            <Link href="/login">登录</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
