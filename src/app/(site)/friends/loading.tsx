import { Skeleton } from "@/components/ui/skeleton";
import { TechSpinner } from "@/components/common/loading";

export default function Loading() {
  return (
    <div className="container py-10 max-w-5xl mx-auto min-h-screen relative">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
        <TechSpinner />
      </div>
      <div className="mb-10 text-center space-y-4 opacity-50">
        <Skeleton className="h-10 w-48 mx-auto bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-6 w-96 mx-auto bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-60 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
