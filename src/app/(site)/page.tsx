import { Hero } from "@/components/site/hero";
import { StatusGrid } from "@/components/site/status-grid";
import { FeatureGrid } from "@/components/site/feature-grid";
import { UtilityGrid } from "@/components/site/utility-grid";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
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
