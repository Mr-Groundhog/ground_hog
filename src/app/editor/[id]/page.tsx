import { redirect, notFound } from "next/navigation";
import { getCategories } from "@/app/dashboard/categories/actions";
import { getPost } from "@/app/dashboard/posts/actions";
import { getCurrentUser } from "@/lib/session";
import { EditorUI } from "../components/editor-ui";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "编辑文章 - 编辑器",
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [post, categories] = await Promise.all([
    getPost(id),
    getCategories(),
  ]);

  if (!post) notFound();

  // 简单的权限检查，实际应在 Server Action 进一步校验
  if (post.userId !== user.id && user.role !== "ADMIN") {
    // 这里可以重定向到无权限页面，或者简单返回
    redirect("/dashboard/posts");
  }

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <EditorUI
      categories={serializedCategories}
      currentUserId={user.id}
      initialData={{
        ...post,
        // 处理可能为 null 的字段
        excerpt: post.excerpt || null,
        coverImage: post.coverImage || null,
        categoryId: post.categoryId || null
      }}
    />
  );
}
