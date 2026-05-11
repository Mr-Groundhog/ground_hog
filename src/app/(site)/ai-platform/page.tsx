import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AiToolsWrapper } from "./components/ai-tools-wrapper";

export const revalidate = 3600;

export default function AiPlatformPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    }>
      <AiToolsWrapper />
    </Suspense>
  );
}
