"use client";

export default function PromptTemplatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">模板加载失败</h2>
        <p className="text-zinc-500 text-sm">请稍后再试</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
