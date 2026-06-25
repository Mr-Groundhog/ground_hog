import { Suspense } from "react";
import { PromptTemplatesWrapper } from "./components/prompt-templates-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default async function PromptTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = (params.status || "") as "PENDING" | "APPROVED" | "REJECTED" | "";
  const category = params.category || "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">提示词模板管理</h1>
          <p className="text-muted-foreground">管理提示词模板与用户提交审核。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <PromptTemplatesWrapper 
          page={page} 
          limit={10} 
          search={search}
          status={status || undefined}
          category={category || undefined}
        />
      </Suspense>
    </div>
  );
}
