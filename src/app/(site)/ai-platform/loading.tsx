import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen text-zinc-100">
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-64 hidden lg:block space-y-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-zinc-800" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 bg-zinc-800" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40 bg-zinc-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
