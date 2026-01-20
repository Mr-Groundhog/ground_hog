export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050505] text-zinc-300">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#00C8D208,transparent)]"></div>

      {/* Top Left Decoration */}
      <div className="absolute left-8 top-8 hidden flex-col gap-1 font-mono text-xs text-zinc-500 md:flex">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500"></div>
          <span className="text-cyan-500">系统：运行中</span>
        </div>
        <span>延迟：14MS</span>
        <span>加密协议：RSA_4096_X</span>
        <span>内核版本：6.8.2-CYBER</span>
      </div>

      {/* Top Right Decoration */}
      <div className="absolute right-8 top-8 hidden flex-col items-end gap-1 font-mono text-xs text-zinc-500 md:flex">
        <span className="text-purple-500">定位：第七分区-7G</span>
        <span>威胁等级：无</span>
        <span>核心温度：32.4°C</span>
        <div className="flex items-center gap-2">
          <span>序列号：</span>
          <div className="flex gap-0.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-2 w-1 ${i > 5 ? 'bg-zinc-700' : 'bg-zinc-300'}`}></div>
            ))}
            <span className="ml-1 text-white">-2A</span>
          </div>
        </div>
      </div>

      {/* Bottom Left Decoration */}
      <div className="absolute bottom-8 left-8 hidden gap-6 font-mono text-xs text-zinc-600 md:flex">
        <span>[ 传输协议：HTTPS ]</span>
        <span>[ 端口：8443 ]</span>
      </div>

      {/* Bottom Right Decoration */}
      <div className="absolute bottom-8 right-8 hidden font-mono text-xs text-zinc-600 md:block">
        © 2024 神经链路接口
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
