import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCodesWrapper } from "./components/credit-codes-wrapper";

export default async function CreditCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">额度码管理</h1>
        <p className="text-muted-foreground">
          批量导入评论抽奖奖池，按批次管理。每个 IP 每天（北京时间 6 点起）可参与一次，可配置前台当前抽奖的批次。
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <CreditCodesWrapper page={page} limit={20} search={search} />
      </Suspense>
    </div>
  );
}
