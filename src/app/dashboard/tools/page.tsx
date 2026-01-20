import { Suspense } from "react";
import { ToolsWrapper } from "./components/tools-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ToolsPage({
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
          <h1 className="text-3xl font-bold tracking-tight">系统工具管理</h1>
          <p className="text-muted-foreground">管理系统工具箱中的工具。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ToolsWrapper 
          page={page} 
          limit={10} 
          search={search} 
        />
      </Suspense>
    </div>
  );
}
