import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PromptTemplatesWrapper } from "./components/prompt-templates-wrapper";

export const revalidate = 3600;

export default function PromptTemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-zinc-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    }>
      <PromptTemplatesWrapper />
    </Suspense>
  );
}
