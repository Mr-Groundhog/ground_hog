"use client";

import * as React from "react";
import Fuse from "fuse.js";
import {
  Search,
  Copy,
  Terminal,
  Folder,
  FileText,
  Settings,
  Globe,
  Lock,
  Archive,
  Cpu,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { Command } from "@/types/command";
import commandsData from "@/data/commands.json";

const CATEGORIES = [
  { name: "文件管理", icon: Folder },
  { name: "文本处理", icon: FileText },
  { name: "系统管理", icon: Cpu },
  { name: "网络", icon: Globe },
  { name: "权限", icon: Lock },
  { name: "压缩", icon: Archive },
];

// 搜索历史存储键
const HISTORY_KEY = "linux_cmd_search_history";
const MAX_HISTORY = 5;

export function LinuxStudy() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<string[]>([]);
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 加载搜索历史
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 初始化 Fuse.js
  const fuse = React.useMemo(
    () =>
      new Fuse(commandsData as Command[], {
        keys: ["name", "desc", "examples.note"],
        threshold: 0.3,
        includeMatches: true,
      }),
    []
  );

  // 过滤命令
  const filteredCommands = React.useMemo(() => {
    let result: Command[] = [];

    if (search.trim()) {
      result = fuse.search(search).map((r) => r.item);
    } else {
      result = commandsData as Command[];
    }

    if (selectedCategory) {
      result = result.filter((cmd) => cmd.category === selectedCategory);
    }

    return result;
  }, [search, selectedCategory, fuse]);

  // 分类统计
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    (commandsData as Command[]).forEach((cmd) => {
      stats[cmd.category] = (stats[cmd.category] || 0) + 1;
    });
    return stats;
  }, []);

  // 保存搜索历史
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // 清除搜索历史
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // 复制命令
  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      toast.success("已复制到剪贴板", {
        description: cmd,
      });
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      saveToHistory(value);
    }
  };

  // 键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" 聚焦搜索框
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // "Escape" 清空搜索
      if (e.key === "Escape") {
        setSearch("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* 左侧分类导航 - 桌面端显示 */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/30 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">命令分类</h2>
          </div>
        </div>
        <nav className="flex-1 p-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              全部命令
            </span>
            <span className="text-xs opacity-70">{(commandsData as Command[]).length}</span>
          </button>
          <div className="mt-2 space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = categoryStats[cat.name] || 0;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.name}
                  </span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部搜索栏 */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索命令... (按 / 快捷键聚焦)"
                className="pl-10 pr-20 h-12 text-base"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 搜索历史 */}
            {history.length > 0 && !search && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                <span>最近搜索：</span>
                {history.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="px-2 py-0.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <Button variant="ghost" size="sm" onClick={clearHistory} className="ml-auto text-xs h-6">
                  清除
                </Button>
              </div>
            )}
          </div>

          {/* 移动端分类筛选 */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              全部 ({commandsData.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = categoryStats[cat.name] || 0;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </header>

        {/* 命令列表 */}
        <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">未找到匹配的命令</p>
              <p className="text-sm mt-1">尝试其他关键词或分类筛选</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCommands.map((cmd) => (
                <Card key={cmd.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-primary">{cmd.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{cmd.desc}</p>
                      <div className="space-y-2">
                        {cmd.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="group relative bg-slate-900 dark:bg-slate-900 bg-gray-100 rounded-md p-3 cursor-pointer active:scale-[0.99] transition-transform"
                            onClick={() => handleCopy(ex.cmd)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-green-400 dark:text-green-400 text-green-700 dark:green-700 font-mono text-sm break-all">
                                  {ex.cmd}
                                </div>
                                <div className="text-slate-500 dark:text-slate-500 text-gray-500 text-xs mt-1">
                                  # {ex.note}
                                </div>
                              </div>
                              <button
                                className="ml-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(ex.cmd);
                                }}
                              >
                                <Copy
                                  className={`h-4 w-4 ${
                                    copiedCmd === ex.cmd
                                      ? "text-green-500"
                                      : "text-slate-400"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
