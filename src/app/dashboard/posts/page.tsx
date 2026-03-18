import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostsWrapper } from "./components/posts-wrapper";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts.</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <PostsWrapper page={page} query={query} />
      </Suspense>
    </div>
  );
}
