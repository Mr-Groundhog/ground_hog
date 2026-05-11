import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FriendLinkFab } from "./components/friend-link-fab";
import { FriendLinksWrapper } from "./components/friend-links-wrapper";

export const revalidate = 3600;

export default function FriendsPage() {
  return (
    <div className="container px-4 py-8 md:py-10 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8 md:mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">友情链接</h1>
        <p className="text-base md:text-lg text-muted-foreground px-2">
          与优秀的博主们建立连接，共同探索更广阔的世界。
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      }>
        <FriendLinksWrapper />
      </Suspense>
      <FriendLinkFab />
    </div>
  );
}
