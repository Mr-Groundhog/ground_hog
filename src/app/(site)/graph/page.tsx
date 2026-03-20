import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostListWrapper } from "./components/post-list-wrapper";
import { CategoryFilterWrapper } from "./components/category-filter-wrapper";

export const dynamic = "force-dynamic";

export default function LifeFeedPage({
  searchParams,
}: {
  searchParams: { categoryId?: string };
}) {
  const categoryId = searchParams.categoryId;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
          <h1 className="text-3xl font-bold tracking-wide text-white md:text-4xl">
            生活随笔流
          </h1>
        </div>
        <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
          用一点时间，把日常的细节写下来。这里不是朋友圈，也不是技术博客，
          而是只属于自己的小型「心情缓冲区」。
        </p>
      </div>

      <Suspense fallback={<Skeleton className="mb-8 h-10 w-full md:w-1/2" />}>
        <CategoryFilterWrapper currentCategoryId={categoryId} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <PostListWrapper categoryId={categoryId} />
      </Suspense>
    </div>
  );
}
