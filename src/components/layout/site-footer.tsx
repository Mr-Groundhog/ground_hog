"use client";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-zinc-800 py-8 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span>系统状态: 在线</span>
          </div>
          <span>内核版本: 5.15.0-88-GENERIC</span>
          <span>时区: UTC+8</span>
        </div>
        
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">GITHUB</a>
          <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
          <a href="#" className="hover:text-white transition-colors">X_COM</a>
        </div>

        <div>
          © 2026 Mr-Groundhog
        </div>
      </div>
    </footer>
  );
}
