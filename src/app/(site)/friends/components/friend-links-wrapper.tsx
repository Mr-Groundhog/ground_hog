import { cache } from 'react';
import { getPublicFriendLinks } from "@/app/(site)/friends/actions";
import { FriendLinkGrid } from "./friend-link-grid";

// 缓存数据获取函数，减少重复数据库查询
const getCachedFriendLinks = cache(async () => {
  return await getPublicFriendLinks();
});

export async function FriendLinksWrapper() {
  const links = await getCachedFriendLinks();
  return <FriendLinkGrid links={links} />;
}