import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen text-zinc-100">
      {/* Hero Skeleton */}
      <div className="w-full py-16">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <Skeleton className="h-12 w-80 bg-zinc-800 mb-4" />
          <Skeleton className="h-6 w-96 bg-zinc-800 mb-8" />
          <Skeleton className="h-12 w-full max-w-xl bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Skeleton */}
        <div className="w-64 hidden lg:block space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-zinc-800" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-zinc-800" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-6 w-40 bg-zinc-800 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
