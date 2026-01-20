import { Suspense } from "react";
import { AiToolsWrapper } from "./components/ai-tools-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AiToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 工具管理</h1>
          <p className="text-muted-foreground">管理 AI 平台展示的工具与申请。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <AiToolsWrapper 
          page={page} 
          limit={10} 
          search={search} 
        />
      </Suspense>
    </div>
  );
}
