"use client";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AdminHeader />
            <ScrollArea className="flex-1 bg-zinc-50 dark:bg-zinc-950">
              <main className="flex-1 p-6">
                {children}
              </main>
            </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
