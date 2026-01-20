import { Suspense } from "react";
import { CommentsWrapper } from "./components/comments-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">评论管理</h1>
          <p className="text-muted-foreground">管理所有博客评论。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <CommentsWrapper page={page} limit={20} />
      </Suspense>
    </div>
  );
}
