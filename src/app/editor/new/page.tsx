import { redirect } from "next/navigation";
import { getCategories } from "@/app/dashboard/categories/actions";
import { getCurrentUser } from "@/lib/session";
import { EditorUI } from "../components/editor-ui";

export const metadata = {
  title: "新建文章 - 编辑器",
};

export default async function NewPostPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?from=/editor/new");
  }

  const categories = await getCategories();

  // 确保传递给客户端组件的数据是可序列化的
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return <EditorUI categories={serializedCategories} currentUserId={user.id} />;
}
