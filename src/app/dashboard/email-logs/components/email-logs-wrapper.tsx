import { getEmailLogs } from "@/lib/email-service";
import { EmailLogsList } from "./email-logs-list";

export async function EmailLogsWrapper({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { data, total, totalPages } = await getEmailLogs(page, limit);

  return (
    <EmailLogsList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
    />
  );
}