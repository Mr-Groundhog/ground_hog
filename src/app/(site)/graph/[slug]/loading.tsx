import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-4 w-20 bg-zinc-800" />
          <Skeleton className="h-10 w-3/4 bg-zinc-800" />
          <Skeleton className="h-5 w-full bg-zinc-800" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </div>
          <Skeleton className="h-64 w-full bg-zinc-800 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800" />
            <Skeleton className="h-4 w-4/6 bg-zinc-800" />
            <Skeleton className="h-32 w-full bg-zinc-800" />
          </div>
        </div>
        <aside className="hidden lg:block space-y-6">
          <Skeleton className="h-40 w-full bg-zinc-800 rounded-xl" />
          <Skeleton className="h-48 w-full bg-zinc-800 rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
