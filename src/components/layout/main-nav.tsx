"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X, Loader2 } from "lucide-react";
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

// 天气数据类型
interface WeatherData {
  city: string;
  temperature: string | number;
  weather: string;
}

export function MainNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoaded, fetchUser, logout } = useUserStore();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  // 获取天气数据
  React.useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://uapis.cn/api/v1/misc/weather?adcode=330782");
        const json = await res.json();
        setWeather({
          city: json.city,
          temperature: json.temperature,
          weather: json.weather,
        });
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const navItems = [
    { href: "/tools", label: "工具箱" },
    { href: "/ai-platform", label: "AI 平台" },
    // { href: "/history", label: "个人简介" },
    { href: "/graph", label: "生活随笔" },
    { href: "/friends", label: "友链" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const loginTarget = "/api/logto/sign-in";

  return (
    <>
      {/* PC端导航栏 */}
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
              一梦五千年
            </span>
          </Link>

          <NavigationMenu className="hidden md:block">
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
          {/* PC端天气显示 */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-zinc-800/30 rounded-full whitespace-nowrap">
            {weatherLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>获取天气...</span>
              </>
            ) : weather ? (
              <>
                <span>{weather.city}</span>
                <span className="text-zinc-600">|</span>
                <span>{weather.temperature}°C</span>
                <span className="text-white/80">{weather.weather}</span>
              </>
            ) : null}
          </div>

          {mounted && isLoaded && isAuthenticated ? (
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
              <a href={loginTarget}>登录</a>
            </Button>
          )}
          {/* 手机端汉堡菜单按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 手机端抽屉菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-[#09090b]/95 backdrop-blur-sm">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-800/50 text-cyan-400"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </Link>
              );
            })}
            {/* 手机端登录状态 */}
            {mounted && isLoaded && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-xs text-zinc-500">
                      {user?.username || user?.email}
                    </div>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-cyan-400"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                ) : (
                  <a
                    href={loginTarget}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-md bg-zinc-100 text-sm font-semibold text-zinc-950 hover:bg-white"
                  >
                    登录
                  </a>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

