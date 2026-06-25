import { getPromptTemplates, getPromptTemplateStats } from "../actions";
import { PromptTemplateList } from "./prompt-template-list";

export async function PromptTemplatesWrapper({
  page,
  limit,
  search,
  status,
  category,
}: {
  page: number;
  limit: number;
  search: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  category?: string;
}) {
  const [{ data, total, totalPages }, stats] = await Promise.all([
    getPromptTemplates({ page, limit, search, status, category }),
    getPromptTemplateStats(),
  ]);

  return (
    <PromptTemplateList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
      stats={stats}
    />
  );
}
