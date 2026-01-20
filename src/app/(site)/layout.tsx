
import { MainNav } from "@/components/layout/main-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]">
        <div className="flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
        <main className="flex flex-col min-h-full">
          {children}
        </main>
        <SiteFooter />
      </ScrollArea>
    </div>
  );
}
