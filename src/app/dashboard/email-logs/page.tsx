import { Suspense } from "react";
import { EmailLogsWrapper } from "./components/email-logs-wrapper";
import { TestEmailDialog } from "./components/test-email-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default async function EmailLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">邮件管理</h1>
          <p className="text-muted-foreground">查看所有邮件发送记录和状态。</p>
        </div>
        <TestEmailDialog>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            测试邮件服务
          </Button>
        </TestEmailDialog>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <EmailLogsWrapper page={page} limit={10} />
      </Suspense>
    </div>
  );
}