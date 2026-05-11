import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 p-6">
        <Skeleton className="h-8 w-48 mx-auto bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
      </div>
    </div>
  );
}
