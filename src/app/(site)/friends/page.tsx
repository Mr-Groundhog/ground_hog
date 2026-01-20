import { Suspense } from "react";
import { FriendLinkFab } from "./components/friend-link-fab";
import { FriendLinksWrapper } from "./components/friend-links-wrapper";
import { TechSpinner } from "@/components/common/loading";

export const revalidate = 3600;

export default function FriendsPage() {
  return (
    <div className="container py-10 max-w-5xl mx-auto min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">友情链接</h1>
        <p className="text-lg text-muted-foreground">
          与优秀的博主们建立连接，共同探索更广阔的世界。
        </p>
      </div>

      <Suspense fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <TechSpinner />
        </div>
      }>
        <FriendLinksWrapper />
      </Suspense>
      <FriendLinkFab />
    </div>
  );
}
