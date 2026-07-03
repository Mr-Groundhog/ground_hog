import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SessionConverter = dynamic(
  () => import("@/components/tools/session-converter").then((m) => m.SessionConverter),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[560px] w-full" />
          <Skeleton className="h-[560px] w-full" />
        </div>
      </div>
    ),
  }
);

export default function AuthToCpaPage() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <SessionConverter />
    </div>
  );
}
