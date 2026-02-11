
import { MainNav } from "@/components/layout/main-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ParticlesBackground } from "@/components/site/particles-background";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col relative">
      <ParticlesBackground />
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]">
        <div className="flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1 relative z-10">
        <div className="flex min-h-full flex-col">
          {children}
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
