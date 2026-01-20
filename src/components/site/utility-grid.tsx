"use client";

import { LayoutGrid, Terminal, FileText, Signal } from "lucide-react";

const utilities = [
  {
    icon: LayoutGrid,
    title: "工具箱",
    desc: "生产环境中使用的操作和环境管理面板。",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10"
  },
  {
    icon: Terminal,
    title: "AI 终端",
    desc: "具有自定义上下文的内置LLM接口，用于系统持续。",
    color: "text-green-400",
    bg: "bg-green-500/10"
  },
  {
    icon: FileText,
    title: "个人简历.PDF",
    desc: "详尽的技术历史和职业及潜能轨迹记录。",
    color: "text-white",
    bg: "bg-zinc-100/10"
  },
  {
    icon: Signal,
    title: "系统日志",
    desc: "实时活动数据：健身记录、阅读清单和运行足迹。",
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  }
];

export function UtilityGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {utilities.map((item, index) => (
        <div key={index} className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50">
          <div>
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <h3 className="mb-2 font-bold text-white">{item.title}</h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
