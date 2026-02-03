import { cache } from 'react';
import { getPublicAiTools } from "@/app/(site)/ai-platform/actions";
import { AiPlatformClient } from "../client";

// 缓存数据获取函数，减少重复数据库查询
const getCachedAiTools = cache(async () => {
  return await getPublicAiTools();
});

export async function AiToolsWrapper() {
  const tools = await getCachedAiTools();
  return <AiPlatformClient initialTools={tools} />;
}