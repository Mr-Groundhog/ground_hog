import { getAiTools } from "../actions";
import { AiToolList } from "./ai-tool-list";

export async function AiToolsWrapper({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search: string;
}) {
  const { data, total, totalPages } = await getAiTools({
    page,
    limit,
    search,
  });

  return (
    <AiToolList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
    />
  );
}
