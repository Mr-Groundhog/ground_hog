import { getComments } from "../actions";
import { CommentList } from "./comment-list";

export async function CommentsWrapper({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { data, totalPages, total } = await getComments(page, limit);

  return (
    <CommentList
      data={data}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
