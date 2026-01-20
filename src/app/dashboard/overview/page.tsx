
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Ticket, 
  ShoppingCart, 
  ShieldCheck, 
  Users, 
  FileBarChart, 
  Settings, 
  KeyRound,
  MoreHorizontal 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
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

const data = [
  { name: '1月', uv: 200, pv: 100 },
  { name: '2月', uv: 300, pv: 150 },
  { name: '3月', uv: 450, pv: 200 },
  { name: '4月', uv: 600, pv: 280 },
  { name: '5月', uv: 700, pv: 350 },
  { name: '6月', uv: 750, pv: 400 },
  { name: '7月', uv: 600, pv: 300 },
  { name: '8月', uv: 400, pv: 250 },
  { name: '9月', uv: 300, pv: 200 },
  { name: '10月', uv: 800, pv: 450 },
  { name: '11月', uv: 900, pv: 500 },
  { name: '12月', uv: 600, pv: 350 },
];

const pieData = [
  { name: 'Converted', value: 75 },
  { name: 'Remaining', value: 25 },
];
const COLORS = ['#3b82f6', '#e5e7eb'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="访问量" 
          value="2,000" 
          icon={Eye} 
          trend="12%" 
          trendUp={true} 
          color="bg-blue-500"
        />
        <StatCard 
          title="销售额" 
          value="¥20,000" 
          icon={Ticket} 
          trend="8%" 
          trendUp={true} 
          color="bg-orange-500"
          iconColor="text-orange-500"
        />
        <StatCard 
          title="订单量" 
          value="8,000" 
          icon={ShoppingCart} 
          trend="2%" 
          trendUp={false} 
          color="bg-cyan-500"
          iconColor="text-cyan-500"
        />
        <StatCard 
          title="成交额" 
          value="¥5,000" 
          icon={ShieldCheck} 
          trend="15%" 
          trendUp={true} 
          color="bg-purple-500"
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Section */}
      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">流量趋势</CardTitle>
            <p className="text-xs text-muted-foreground">最近30天访问量统计</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">今日</Button>
            <Button variant="default" size="sm" className="h-7 text-xs bg-blue-500 hover:bg-blue-600">本月</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">全年</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Area type="monotone" dataKey="uv" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                <Area type="monotone" dataKey="pv" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Nav */}
        <Card className="col-span-2">
           <CardHeader>
            <CardTitle className="text-base font-medium">快速导航</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 py-8">
            <QuickNavItem icon={Users} label="用户管理" color="text-blue-500" />
            <QuickNavItem icon={FileBarChart} label="报表分析" color="text-green-500" />
            <QuickNavItem icon={Settings} label="核心设置" color="text-purple-500" />
            <QuickNavItem icon={KeyRound} label="权限验证" color="text-orange-500" />
          </CardContent>
        </Card>

        {/* Conversion Stats */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">转化率统计</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
             <div className="relative h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">75%</span>
                    <span className="text-xs text-muted-foreground">总体转化</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        2024 © ground_hog Dashboard - Built with Tailwind CSS
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, iconColor }: any) {
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
