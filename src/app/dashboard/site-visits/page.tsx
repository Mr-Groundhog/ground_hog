import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db";
import { SiteVisitsList } from "./components/site-visits-list";

export default async function SiteVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 20;

  const [data, total] = await Promise.all([
    prisma.siteVisit.findMany({
      select: {
        id: true,
        pageUrl: true,
        device: true,
        referrer: true,
        ip: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.siteVisit.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">访问记录</h1>
        <p className="text-muted-foreground">查看网站用户访问日志。</p>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <SiteVisitsList
          data={data}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
