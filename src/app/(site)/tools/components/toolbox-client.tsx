"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tool } from "@prisma/client";
import { 
  Search, 
  Command, 
  History, 
  Code2, 
  FileJson, 
  Globe, 
  Image as ImageIcon, 
  Shield, 
  Cpu,
  ArrowRight,
  Plus,
  LayoutGrid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { SubmitToolDialog } from "./submit-tool-dialog";

interface ToolboxClientProps {
  initialTools: Tool[];
  categories: string[];
}

// Icon helper
const getIcon = (name: string | null) => {
  if (!name) return Code2;
  // @ts-ignore
  const Icon = Icons[name];
  return Icon || Code2;
};

export function ToolboxClient({ initialTools, categories: propCategories }: ToolboxClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const allCategories = [{ id: "all", name: "全部工具", icon: LayoutGrid }, ...propCategories.map(cat => ({
    id: cat,
    name: cat,
    icon: Code2 // Default icon, can be improved later
  }))];

  const filteredTools = initialTools.filter(tool => {
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (tool: Tool) => {
    if (tool.type === "LOCAL") {
      router.push(tool.url);
    } else {
      window.open(tool.url, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NORMAL": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "DEBUG": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "UPDATE": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "MAINTENANCE": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "NORMAL": return "正常";
      case "DEBUG": return "调试";
      case "UPDATE": return "更新";
      case "MAINTENANCE": return "维护";
      case "PENDING": return "待审核";
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col fixed left-0 top-16 bottom-0 z-10 hidden md:flex bg-black/40 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">工具分类</h2>
          <div className="text-[10px] text-cyan-500 font-mono mb-6">CORE MODULES v1.4</div>
          
          <nav className="space-y-1">
            {allCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeCategory === cat.id 
                      ? "bg-cyan-950/30 text-cyan-400 border-r-2 border-cyan-500" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-zinc-800">
          <SubmitToolDialog />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="container max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Search Area */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input 
                type="text"
                placeholder="搜索系统工具 (Enter 或 / 激活)..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
                  <span className="text-xs">CMD</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Recent / Quick Actions */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <History className="h-4 w-4" />
              <span>最近使用:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-cyan-400 h-8">
                <Code2 className="mr-2 h-3 w-3" /> JSON 格式化
              </Button>
              <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-cyan-400 h-8">
                <Shield className="mr-2 h-3 w-3" /> Base64 转换
              </Button>
            </div>
          </div>

          {/* Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-6 w-1 bg-cyan-500 rounded-full" />
                <h2 className="text-xl font-bold text-zinc-100">推荐工具</h2>
                <span className="text-xs font-mono text-zinc-600 uppercase">LISTING_{filteredTools.length.toString().padStart(3, '0')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("text-zinc-400 hover:text-cyan-400", viewMode === "grid" && "text-cyan-400 bg-cyan-950/20")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("text-zinc-400 hover:text-cyan-400", viewMode === "list" && "text-cyan-400 bg-cyan-950/20")}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid-cols-1"
            )}>
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => {
                  const Icon = getIcon(tool.icon);
                  return (
                    <div 
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4 hover:bg-zinc-900/80 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer overflow-hidden h-24 flex flex-col justify-between"
                    >
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {tool.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-2">
                         <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono transform scale-90 origin-left", 
                             tool.status === 'NORMAL' ? "text-green-500" :
                             tool.status === 'DEBUG' ? "text-yellow-500" :
                             tool.status === 'UPDATE' ? "text-blue-500" :
                             tool.status === 'MAINTENANCE' ? "text-red-500" :
                             "text-zinc-500"
                           )}>
                             [{getStatusText(tool.status)}]
                           </span>
                           <span className="text-[9px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                             {tool.category}
                           </span>
                         </div>
                         
                         <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-500">
                  没有找到匹配的工具
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
