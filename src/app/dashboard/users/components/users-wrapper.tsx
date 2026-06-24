import { getUsers } from "../actions";
import { UserList } from "./user-list";

export async function UsersWrapper({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  try {
    const { data, total, totalPages } = await getUsers(page, 10, query);

    // unstable_cache 序列化后 Date 可能已是字符串，需兼容处理
    const serializableData = data.map((user) => ({
      ...user,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    }));

    return (
      <UserList
        data={serializableData}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    );
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">加载用户列表失败</p>
          <p className="text-sm">请检查数据库连接或稍后重试</p>
        </div>
      </div>
    );
  }
}
