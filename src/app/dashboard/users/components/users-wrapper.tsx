import { getUsers } from "../actions";
import { UserList } from "./user-list";

export async function UsersWrapper({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const { data, total, totalPages } = await getUsers(page, 10, query);

  // 序列化 Date 对象，防止传递给客户端组件时报错
  const serializableData = data.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <UserList
      data={serializableData}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
