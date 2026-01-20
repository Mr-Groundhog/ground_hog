import { getPosts } from "@/app/dashboard/posts/actions";
import { PostFeed } from "./post-feed";

export async function PostListWrapper({ categoryId }: { categoryId?: string }) {
  const { data: posts, totalPages, page } = await getPosts(1, 10, "", categoryId);
  
  return (
    <PostFeed 
      initialPosts={posts} 
      initialPage={page} 
      totalPages={totalPages}
      categoryId={categoryId}
    />
  );
}
