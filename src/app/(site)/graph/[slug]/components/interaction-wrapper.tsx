import { getInteractionStatus } from "@/app/(site)/graph/actions";
import { InteractionButtons } from "@/components/blog/interaction-buttons";
import { getCurrentUser } from "@/lib/session";

export async function InteractionWrapper({ postId }: { postId: string }) {
  const [status, currentUser] = await Promise.all([
    getInteractionStatus(postId),
    getCurrentUser().catch(() => null)
  ]);

  return (
    <InteractionButtons
      postId={postId}
      initialLiked={status.liked}
      initialFavorited={status.favorited}
      currentUser={currentUser}
    />
  );
}
