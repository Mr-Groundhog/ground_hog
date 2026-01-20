import { getPublicFriendLinks } from "@/app/(site)/friends/actions";
import { FriendLinkGrid } from "./friend-link-grid";

export async function FriendLinksWrapper() {
  const links = await getPublicFriendLinks();
  return <FriendLinkGrid links={links} />;
}
