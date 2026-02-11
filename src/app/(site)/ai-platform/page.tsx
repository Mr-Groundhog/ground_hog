import { Suspense } from "react";
import { AiToolsWrapper } from "./components/ai-tools-wrapper";
import { TechSpinner } from "@/components/common/loading";

export const revalidate = 3600;

export default function AiPlatformPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <TechSpinner />
      </div>
    }>
      <AiToolsWrapper />
    </Suspense>
  );
}
