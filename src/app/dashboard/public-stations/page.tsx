import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicStationsWrapper } from "./components/public-stations-wrapper";

export default async function PublicStationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || "";
  const search = params.search || "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">公益站管理</h1>
        <p className="text-muted-foreground">
          审核用户提交的公益站点，通过后手动下发额度码并邮件通知。
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <PublicStationsWrapper
          page={page}
          limit={20}
          status={status}
          search={search}
        />
      </Suspense>
    </div>
  );
}
