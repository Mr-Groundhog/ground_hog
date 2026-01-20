import { Suspense } from "react";
import { UsersWrapper } from "./components/users-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <UsersWrapper page={page} query={query} />
      </Suspense>
    </div>
  );
}
