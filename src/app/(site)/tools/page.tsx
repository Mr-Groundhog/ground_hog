import { Suspense } from "react";
import { getPublicTools } from "./actions";
import { ToolboxClient } from "./components/toolbox-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ToolboxPage() {
  const tools = await getPublicTools();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <ToolboxClient initialTools={tools} />
      </Suspense>
    </div>
  );
}
