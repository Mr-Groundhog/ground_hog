import { getPosts } from "../actions";
import { PostList } from "./post-list";

interface PostsWrapperProps {
  page: number;
  query: string;
}

export async function PostsWrapper({ page, query }: PostsWrapperProps) {
  const { data, totalPages, total } = await getPosts(page, 10, query);

  return (
    <PostList 
      data={data} 
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
