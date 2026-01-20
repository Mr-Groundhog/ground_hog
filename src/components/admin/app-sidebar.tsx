"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { adminRoutes, AdminRoute } from "@/config/admin-menu"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                   <Image src="/static/logo/hog.png" alt="Logo" width={32} height={32} className="object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ground Hog</span>
                  <span className="truncate text-xs">Admin Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {adminRoutes.map((route) => (
              <AppSidebarItem key={route.path} item={route} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-center text-muted-foreground">
           v1.0.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function AppSidebarItem({ item, isSub = false }: { item: AdminRoute; isSub?: boolean }) {
    const pathname = usePathname()
    if (!item.visible) return null

    let renderItem = item
    let isCatalog = item.type === "CATALOG"

    // 目录转菜单逻辑
    if (isCatalog && item.children?.length === 1) {
       renderItem = item.children[0]
       isCatalog = false
    }

    const hasChildren = renderItem.children && renderItem.children.length > 0
    const isActive = pathname === renderItem.path

    if (isCatalog && hasChildren) {
        // 如果是子级目录
        const Container = isSub ? SidebarMenuSubItem : SidebarMenuItem
        const ButtonComp = isSub ? SidebarMenuSubButton : SidebarMenuButton
        // 检查子项是否有激活的
        const isChildActive = renderItem.children?.some(child => pathname.startsWith(child.path))

        return (
            <Collapsible
                asChild
                defaultOpen={isChildActive} // 如果子项激活，默认展开
                className="group/collapsible"
            >
                <Container>
                    <CollapsibleTrigger asChild>
                        <ButtonComp tooltip={renderItem.name}>
                             {renderItem.icon && <renderItem.icon />}
                             <span>{renderItem.name}</span>
                             <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </ButtonComp>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {renderItem.children?.map(child => (
                                <AppSidebarItem key={child.path} item={child} isSub={true} />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Container>
            </Collapsible>
        )
    }

    // 菜单项
    if (isSub) {
        return (
            <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link href={renderItem.path}>
                        {renderItem.icon && <renderItem.icon />}
                        <span>{renderItem.name}</span>
                    </Link>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        )
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={renderItem.name}>
                <Link href={renderItem.path}>
                    {renderItem.icon && <renderItem.icon />}
                    <span>{renderItem.name}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
