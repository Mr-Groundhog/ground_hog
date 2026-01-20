import { Suspense } from "react";
import { CategoriesWrapper } from "./components/categories-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分类管理</h1>
          <p className="text-muted-foreground">管理博客文章分类。</p>
        </div>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <CategoriesWrapper />
      </Suspense>
    </div>
  );
}
