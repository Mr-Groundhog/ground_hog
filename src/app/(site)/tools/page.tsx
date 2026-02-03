import { Suspense } from "react";
import { getPublicTools } from "./actions";
import { ToolboxClient } from "./components/toolbox-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getDistinctToolCategories } from "@/app/dashboard/tools/actions";

// 设置合理的缓存时间，避免频繁的数据请求
export const revalidate = 300; // 5分钟缓存

export default async function ToolboxPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <ToolboxPromise />
      </Suspense>
    </div>
  );
}

// 将数据获取包装在单独的组件中，以便更好地控制缓存
async function ToolboxPromise() {
  const [tools, categories] = await Promise.all([
    getPublicTools(),
    getDistinctToolCategories(),
  ]);

  return <ToolboxClient initialTools={tools} categories={categories} />;
}