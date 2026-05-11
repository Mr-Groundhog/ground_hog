import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-10 max-w-5xl mx-auto min-h-screen">
      <div className="mb-10 text-center space-y-4">
        <Skeleton className="h-10 w-48 mx-auto bg-zinc-800" />
        <Skeleton className="h-6 w-96 mx-auto bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
