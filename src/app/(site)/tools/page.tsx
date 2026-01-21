import { Suspense } from "react";
import { getPublicTools } from "./actions";
import { ToolboxClient } from "./components/toolbox-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getDistinctToolCategories } from "@/app/dashboard/tools/actions";

export const dynamic = "force-dynamic";

export default async function ToolboxPage() {
  const tools = await getPublicTools();
  const categories = await getDistinctToolCategories();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <ToolboxClient initialTools={tools} categories={categories} />
      </Suspense>
    </div>
  );
}
