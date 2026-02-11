"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Users, 
  FileBarChart, 
  Settings, 
  KeyRound,
  MoreHorizontal,
  MousePointerClick
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { 
  getAnalyticsSummary, 
  getTrafficTrend, 
  getTopPages, 
  TrendData, 
  PageViewData 
} from "./actions";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalPV: 0,
    totalUV: 0,
    todayPV: 0,
    todayUV: 0,
    yesterdayPV: 0,
    yesterdayUV: 0,
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topPages, setTopPages] = useState<PageViewData[]>([]);
  const [trendType, setTrendType] = useState<'day' | 'month' | 'year'>('day');

  useEffect(() => {
    // Fetch Summary
    getAnalyticsSummary().then(setSummary);
    // Fetch Top Pages
    getTopPages().then(setTopPages);
  }, []);

  useEffect(() => {
    // Fetch Trend when type changes
    getTrafficTrend(trendType).then(setTrendData);
  }, [trendType]);

  // Calculate trends
  const pvTrend = summary.yesterdayPV > 0 
    ? ((summary.todayPV - summary.yesterdayPV) / summary.yesterdayPV * 100).toFixed(1) + "%" 
    : "N/A";
  const pvTrendUp = summary.todayPV >= summary.yesterdayPV;

  const uvTrend = summary.yesterdayUV > 0
    ? ((summary.todayUV - summary.yesterdayUV) / summary.yesterdayUV * 100).toFixed(1) + "%"
    : "N/A";
  const uvTrendUp = summary.todayUV >= summary.yesterdayUV;

  const COLORS = ['#3b82f6', '#e5e7eb'];

  return (
    <div className="space-y-6">
      {/* Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="今日访问 (PV)" 
          value={summary.todayPV.toLocaleString()} 
          icon={Eye} 
          trend={pvTrend} 
          trendUp={pvTrendUp} 
          color="bg-blue-500"
          subValue={`总计: ${summary.totalPV.toLocaleString()}`}
        />
        <StatCard 
          title="今日访客 (UV)" 
          value={summary.todayUV.toLocaleString()} 
          icon={Users} 
          trend={uvTrend} 
          trendUp={uvTrendUp} 
          color="bg-purple-500"
          iconColor="text-purple-500"
          subValue={`总计: ${summary.totalUV.toLocaleString()}`}
        />
        {/* Placeholder cards for layout balance */}
        <StatCard 
          title="平均停留时间" 
          value="0m 0s" 
          icon={MousePointerClick} 
          trend="0%" 
          trendUp={true} 
          color="bg-cyan-500"
          iconColor="text-cyan-500"
        />
        <StatCard 
          title="跳出率" 
          value="0%" 
          icon={FileBarChart} 
          trend="0%" 
          trendUp={true} 
          color="bg-orange-500"
          iconColor="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">流量趋势</CardTitle>
            <p className="text-xs text-muted-foreground">访问量统计概览</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={trendType === 'day' ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setTrendType('day')}
            >
              按天
            </Button>
            <Button 
              variant={trendType === 'month' ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setTrendType('month')}
            >
              按月
            </Button>
            <Button 
              variant={trendType === 'year' ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setTrendType('year')}
            >
              按年
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                />
                <Tooltip />
                <Area type="monotone" dataKey="uv" name="访客数(UV)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                <Area type="monotone" dataKey="pv" name="访问量(PV)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Pages */}
        <Card className="col-span-2">
           <CardHeader>
            <CardTitle className="text-base font-medium">热门页面 TOP 10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="text-sm font-medium w-6">{i + 1}.</span>
                    <span className="text-sm text-muted-foreground truncate" title={page.url}>
                      {page.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">PV: <span className="text-foreground font-medium">{page.pv}</span></span>
                    <span className="text-muted-foreground">UV: <span className="text-foreground font-medium">{page.uv}</span></span>
                  </div>
                </div>
              ))}
              {topPages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Nav (Kept from original) */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">快速导航</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 py-4">
            <QuickNavItem icon={Users} label="用户管理" color="text-blue-500" />
            <QuickNavItem icon={FileBarChart} label="报表分析" color="text-green-500" />
            <QuickNavItem icon={Settings} label="核心设置" color="text-purple-500" />
            <QuickNavItem icon={KeyRound} label="权限验证" color="text-orange-500" />
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        2026 © ground_hog Dashboard - Built with Tailwind CSS
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, iconColor, subValue }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          <div className={`rounded-full p-2 bg-opacity-10 ${iconColor ? iconColor.replace('text-', 'bg-') + '/10' : 'bg-blue-100'}`}>
            <Icon className={`h-5 w-5 ${iconColor || 'text-blue-500'}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center text-xs">
              <span className={trendUp ? "text-green-500" : "text-red-500"}>
                 {trendUp ? "↑" : "↓"} {trend}
              </span>
              <span className="ml-1 text-muted-foreground">较昨日</span>
           </div>
           {subValue && (
             <div className="text-xs text-muted-foreground">{subValue}</div>
           )}
        </div>
        <div className="mt-3 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: '60%' }} />
        </div>
      </CardContent>
    </Card>
  )
}

function QuickNavItem({ icon: Icon, label, color }: any) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 p-4 rounded-lg transition-colors">
            <div className={`p-3 rounded-full bg-background shadow-sm border ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
    )
}
