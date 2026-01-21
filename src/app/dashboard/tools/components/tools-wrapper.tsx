import { getDistinctToolCategories, getTools } from "../actions";
import { ToolList } from "./tool-list";

export async function ToolsWrapper({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search: string;
}) {
  const { data, total, totalPages } = await getTools({
    page,
    limit,
    search,
  });

  const categories = await getDistinctToolCategories();

  return (
    <ToolList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
      categories={categories}
    />
  );
}
