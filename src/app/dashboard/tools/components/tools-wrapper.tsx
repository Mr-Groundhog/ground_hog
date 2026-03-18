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
  const [{ data, total, totalPages }, categories] = await Promise.all([
    getTools({
      page,
      limit,
      search,
    }),
    getDistinctToolCategories(),
  ]);

  return (
    <ToolList
      categories={categories}
      data={data}
      limit={limit}
      page={page}
      total={total}
      totalPages={totalPages}
    />
  );
}
