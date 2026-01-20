import { Suspense } from "react";
import { PostsWrapper } from "./components/posts-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
          <p className="text-muted-foreground">发布和管理博客文章。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <PostsWrapper page={page} query={query} />
      </Suspense>
    </div>
  );
}
