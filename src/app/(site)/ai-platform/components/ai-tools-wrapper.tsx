import { getPublicAiTools } from "@/app/(site)/ai-platform/actions";
import { AiPlatformClient } from "../client";

export async function AiToolsWrapper() {
  const tools = await getPublicAiTools();
  return <AiPlatformClient initialTools={tools} />;
}
