import { getCommentsByPostId } from "@/app/(site)/graph/actions";
import { CommentSection } from "@/components/blog/comment-section";
import { getCurrentUser } from "@/lib/session";

export async function CommentsWrapper({ postId }: { postId: string }) {
  const [comments, currentUser] = await Promise.all([
    getCommentsByPostId(postId),
    getCurrentUser().catch(() => null)
  ]);

  return (
    <CommentSection
      postId={postId}
      comments={comments}
      currentUser={currentUser}
    />
  );
}
