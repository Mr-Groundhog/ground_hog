import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Hero = dynamic(
  () => import("@/components/site/hero").then((m) => m.Hero),
  { loading: () => <Skeleton className="h-[400px] w-full rounded-xl md:h-[500px]" /> }
);

const StatusGrid = dynamic(
  () => import("@/components/site/status-grid").then((m) => m.StatusGrid),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);

const FeatureGrid = dynamic(
  () => import("@/components/site/feature-grid").then((m) => m.FeatureGrid),
  { loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

const UtilityGrid = dynamic(
  () => import("@/components/site/utility-grid").then((m) => m.UtilityGrid),
  { loading: () => <Skeleton className="h-40 w-full rounded-xl" /> }
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="space-y-8">
          <Hero />
          <StatusGrid />
          <div className="py-8">
            <FeatureGrid />
          </div>
          <UtilityGrid />
        </div>
      </div>
    </div>
  );
}
