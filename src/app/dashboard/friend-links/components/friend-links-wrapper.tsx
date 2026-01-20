import { getFriendLinks } from "../actions";
import { FriendLinkList } from "./friend-link-list";

export async function FriendLinksWrapper({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { data, total, totalPages } = await getFriendLinks({ page, limit });

  return (
    <FriendLinkList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
    />
  );
}
