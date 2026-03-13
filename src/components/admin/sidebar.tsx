
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminRoute, MenuType } from "@/config/admin-menu";
import { ChevronRight, Circle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminSidebarProps {
  routes: AdminRoute[];
}

import Image from "next/image";

export function AdminSidebar({ routes }: AdminSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm">
      <div className="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <Image src="/static/logo/hog.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <span>一梦五千年</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {routes.map((route) => (
            <SidebarItem key={route.path} item={route} />
          ))}
        </nav>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">
        v1.0.0
      </div>
    </div>
  );
}

function SidebarItem({ item, level = 0 }: { item: AdminRoute; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(true); // Default open for simplicity
  
  // If visible is false, return null
  if (!item.visible) return null;

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  
  // Logic: 
  // 1. If Catalog and has children > 1 -> Collapsible
  // 2. If Catalog and has 1 child -> Show child directly (usually) or treat as menu? 
  //    The prompt said "If directory only has one route data, treat it as menu".
  //    Let's handle that logic.
  
  let renderItem = item;
  let isCatalog = item.type === "CATALOG";

  if (isCatalog && item.children?.length === 1) {
    // Treat as menu, use the child
    renderItem = item.children[0];
    isCatalog = false; // It becomes a menu
  }

  const isActive = pathname === renderItem.path;
  const isChildActive = item.children?.some(child => pathname.startsWith(child.path));

  if (isCatalog && hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
              level > 0 && "pl-8" // Indent for nested items
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.name}</span>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-1">
          {item.children?.map((child) => (
            <SidebarItem key={child.path} item={child} level={level + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Render as Menu Item
  return (
    <Link
      href={renderItem.path}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        isActive ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400" : "text-zinc-500 dark:text-zinc-400",
        level > 0 && "pl-8"
      )}
    >
      {/* Show icon if exists, or a dot if it's a child level item without icon? 
          Usually top level has icon. Nested might not. 
          If no icon provided for nested item, maybe show nothing or a dot.
      */}
      {renderItem.icon ? (
        <renderItem.icon className="h-4 w-4" />
      ) : level > 0 ? (
         // If nested and no icon, maybe just align? Or dot?
         // Image shows icons for all items on left.
         // Let's assume we pass icon. If not, use Circle as dot.
         <Circle className="h-2 w-2 fill-current opacity-50" />
      ) : null}
      
      <span>{renderItem.name}</span>
      
      {isActive && (
        <div className="ml-auto h-2 w-1 rounded-full bg-cyan-500" />
      )}
    </Link>
  );
}
