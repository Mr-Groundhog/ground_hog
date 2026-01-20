"use client";

import * as React from "react";
import { ArrowRight, Rocket, Cpu, Database, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const newsItems = [
  {
    icon: Rocket,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    title: '部署成功 : v4.2.0 "Kestrel"',
    tag: "稳定版",
    tagColor: "text-green-500 bg-green-500/10",
    desc: "全新边缘计算层已上线。全球用户访问延迟降低了22%。核心编排库已在 GitHub 开源。",
    timestamp: "2023.10.24_14:30",
  },
  {
    icon: Cpu,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    title: '计算节点扩容 : Cluster-09',
    tag: "进行中",
    tagColor: "text-cyan-500 bg-cyan-500/10",
    desc: "为了应对高并发请求，我们正在向亚太区域集群添加新的 H100 计算节点。预计吞吐量提升 40%。",
    timestamp: "2023.10.25_09:15",
  },
  {
    icon: Database,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    title: '数据库迁移完成',
    tag: "已完成",
    tagColor: "text-purple-500 bg-purple-500/10",
    desc: "核心用户数据库已成功迁移至新的分布式存储系统，数据一致性检查通过，无停机时间。",
    timestamp: "2023.10.23_22:00",
  },
];

export function StatusGrid() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Card: News/Update Carousel (Span 2) */}
      <div className="relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 lg:col-span-2">
        <Carousel setApi={setApi} className="w-full">
          <div className="mb-4 flex items-center justify-end">
             {/* Carousel Controls (Top Right) */}
             <div className="flex gap-2">
               <CarouselPrevious className="static translate-y-0 h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white" />
               <CarouselNext className="static translate-y-0 h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white" />
             </div>
          </div>
          
          <CarouselContent>
            {newsItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="mt-2 max-w-lg text-sm text-zinc-400">
                      {item.desc}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                      <button className="flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300">
                        阅读完整日志 <ArrowRight size={12} />
                      </button>
                      <span className="text-zinc-600">时间戳: {item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                current === index + 1 ? "w-4 bg-cyan-400" : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Card: Resource Load */}
      <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-zinc-300">资源负载</h3>
            <span className="text-xs font-bold text-cyan-400">稳定</span>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">CPU 集群</span>
                <span className="text-zinc-300">42%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full w-[42%] bg-cyan-500"></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">神经网络</span>
                <span className="text-zinc-300">67%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full w-[67%] bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="mt-6 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white">
          诊断控制面板
        </Button>
      </div>
    </div>
  );
}
