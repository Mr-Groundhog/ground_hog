import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/session";

const PanSearch = dynamic(
  () =>
    import("@/components/tools/pan-search").then((m) => m.PanSearch),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  }
);

export default async function PanSearchPage() {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-1 flex-col w-full">
      <PanSearch isLoggedIn={isLoggedIn} />
    </div>
  );
}
