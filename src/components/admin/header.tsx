
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bell, Globe, Settings, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fetchUser, logout } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    logout();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Generate breadcrumbs from pathname
  // e.g. /dashboard/analysis -> Home / Dashboard / Analysis
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-4" />
        <span>首页</span>
        {breadcrumbs.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span>/</span>
            <span className={index === breadcrumbs.length - 1 ? "text-zinc-900 dark:text-zinc-50 font-medium" : ""}>
              {item}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Search removed as requested */}
        
        <div className="flex items-center gap-2">
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleGoHome}>
                   <Home className="h-4 w-4" />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>返回前台</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
             <Globe className="h-4 w-4" />
           </Button>
           {/* <ThemeToggle /> */}
           {/* <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
             <Bell className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
             <Settings className="h-4 w-4" />
           </Button> */}
        </div>

        <div className="h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-auto gap-2 rounded-full pl-2 pr-4 hover:bg-transparent">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs">
                 <span className="font-medium">{user?.username || "Admin"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">{user?.username}</p>
                <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem className="text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
              个人中心
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
              设置
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer" onClick={handleLogout}>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
