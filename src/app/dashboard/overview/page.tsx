import type { ComponentType } from "react";
import {
  Eye,
  FileBarChart,
  KeyRound,
  MousePointerClick,
  Settings,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardOverviewData } from "./actions";
import { OverviewTrendChart } from "./components/overview-trend-chart";

export default async function DashboardOverviewPage() {
  const { summary, trendData, topPages } = await getDashboardOverviewData("day");
  const pvTrend = getTrend(summary.todayPV, summary.yesterdayPV);
  const uvTrend = getTrend(summary.todayUV, summary.yesterdayUV);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          color="bg-blue-500"
          icon={Eye}
          iconColor="text-blue-500"
          subValue={`Total: ${summary.totalPV.toLocaleString()}`}
          title="Today PV"
          trend={pvTrend}
          value={summary.todayPV.toLocaleString()}
        />
        <StatCard
          color="bg-purple-500"
          icon={Users}
          iconColor="text-purple-500"
          subValue={`Total: ${summary.totalUV.toLocaleString()}`}
          title="Today UV"
          trend={uvTrend}
          value={summary.todayUV.toLocaleString()}
        />
        <StatCard
          color="bg-cyan-500"
          icon={MousePointerClick}
          iconColor="text-cyan-500"
          title="Avg. Session"
          trend={{ label: "0%", up: true }}
          value="0m 0s"
        />
        <StatCard
          color="bg-orange-500"
          icon={FileBarChart}
          iconColor="text-orange-500"
          title="Bounce Rate"
          trend={{ label: "0%", up: true }}
          value="0%"
        />
      </div>

      <OverviewTrendChart initialTrendData={trendData} initialTrendType="day" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={`${page.url}-${index}`} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-6 text-sm font-medium">{index + 1}.</span>
                    <span className="truncate text-sm text-muted-foreground" title={page.url}>
                      {page.url}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      PV: <span className="font-medium text-foreground">{page.pv}</span>
                    </span>
                    <span className="text-muted-foreground">
                      UV: <span className="font-medium text-foreground">{page.uv}</span>
                    </span>
                  </div>
                </div>
              ))}
              {topPages.length === 0 ? <div className="py-8 text-center text-muted-foreground">No data</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 py-4">
            <QuickNavItem color="text-blue-500" icon={Users} label="Users" />
            <QuickNavItem color="text-green-500" icon={FileBarChart} label="Reports" />
            <QuickNavItem color="text-purple-500" icon={Settings} label="Settings" />
            <QuickNavItem color="text-orange-500" icon={KeyRound} label="Permissions" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTrend(current: number, previous: number) {
  if (previous <= 0) {
    return { label: "N/A", up: true };
  }

  const percent = ((current - previous) / previous) * 100;
  return {
    label: `${percent.toFixed(1)}%`,
    up: current >= previous,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  iconColor,
  subValue,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  trend: { label: string; up: boolean };
  color: string;
  iconColor: string;
  subValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          <div className={`rounded-full p-2 ${iconColor.replace("text-", "bg-")}/10`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs">
            <span className={trend.up ? "text-green-500" : "text-red-500"}>
              {trend.up ? "+" : "-"} {trend.label}
            </span>
            <span className="ml-1 text-muted-foreground">vs yesterday</span>
          </div>
          {subValue ? <div className="text-xs text-muted-foreground">{subValue}</div> : null}
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full rounded-full ${color}`} style={{ width: "60%" }} />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickNavItem({
  icon: Icon,
  label,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:bg-accent/50">
      <div className={`rounded-full border bg-background p-3 shadow-sm ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
