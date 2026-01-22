"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { 
  Trash2, 
  Copy, 
  FileJson, 
  Download, 
  Search, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle,
  Network,
  Table as TableIcon,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// Dynamically import react-json-view to avoid SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

export function JsonTool() {
  const { resolvedTheme } = useTheme();
  const [rawJson, setRawJson] = React.useState("");
  const [parsedJson, setParsedJson] = React.useState<object | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({ size: "0 B", time: "0ms" });
  const [viewMode, setViewMode] = React.useState<"tree" | "graph" | "table">("tree");
  const [expandAll, setExpandAll] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentMatch, setCurrentMatch] = React.useState(0);
  const [matches, setMatches] = React.useState<HTMLElement[]>([]);

  // Search Logic
  React.useEffect(() => {
    if (!parsedJson || !searchQuery) {
      // Clear highlights
      const highlighted = document.querySelectorAll('.json-highlight');
      highlighted.forEach(el => {
        el.outerHTML = el.textContent || '';
      });
      setMatches([]);
      return;
    }

    // Debounce search
    const timer = setTimeout(() => {
      // Clear previous highlights first
      const prevHighlighted = document.querySelectorAll('.json-highlight');
      prevHighlighted.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        }
      });

      // Find all string values and keys in the viewer
      const container = document.querySelector('.react-json-view');
      if (!container) return;

      // Selectors for react-json-view structure
      const elements = container.querySelectorAll('.string-value, .variable-value, .object-key');
      const found: HTMLElement[] = [];

      elements.forEach((el) => {
        if (el.textContent && el.textContent.toLowerCase().includes(searchQuery.toLowerCase())) {
          // Highlight logic: Wrap text in span
          // Note: react-json-view might re-render and lose this, but it works for static view
          const text = el.textContent;
          const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
          
          if (parts.length > 1) {
             el.innerHTML = parts.map(part => 
               part.toLowerCase() === searchQuery.toLowerCase() 
                 ? `<span class="json-highlight bg-yellow-500 text-black font-bold px-0.5 rounded-sm">${part}</span>` 
                 : part
             ).join('');
             // Store the wrapper element for scrolling
             found.push(el as HTMLElement);
          }
        }
      });

      setMatches(found);
      setCurrentMatch(0);
      if (found.length > 0) {
        found[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, parsedJson]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    const next = (currentMatch + 1) % matches.length;
    setCurrentMatch(next);
    matches[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Real-time parsing
  React.useEffect(() => {
    if (!rawJson.trim()) {
      setParsedJson(null);
      setError(null);
      setStats({ size: "0 B", time: "0ms" });
      return;
    }

    const startTime = performance.now();
    try {
      const parsed = JSON.parse(rawJson);
      const endTime = performance.now();
      const size = new Blob([rawJson]).size;
      
      setParsedJson(parsed);
      setError(null);
      setStats({
        size: formatSize(size),
        time: `${(endTime - startTime).toFixed(0)}ms`
      });
    } catch (err) {
      setError((err as Error).message);
      // Keep previous valid parsed json or clear it? 
      // Usually better to clear or show error state visually
      setParsedJson(null); 
    }
  }, [rawJson]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClear = () => {
    setRawJson("");
    setParsedJson(null);
    setError(null);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawJson);
    toast.success("已复制原始 JSON");
  };

  const handleCopyParsed = () => {
    if (parsedJson) {
      navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2));
      toast.success("已复制解析后的 JSON");
    }
  };

  const handleExport = () => {
    if (!parsedJson) return;
    const blob = new Blob([JSON.stringify(parsedJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("已导出 JSON 文件");
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setRawJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      toast.error("无法格式化：无效的 JSON");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-950">
      {/* Left Column: Raw Input */}
      <div className="flex flex-1 flex-col rounded-xl border bg-background shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Code2 className="h-4 w-4" />
            <span>原始 JSON</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleClear} title="清空">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCopyRaw} title="复制">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 group">
          <textarea
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
            placeholder="在此粘贴您的 JSON 数据..."
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck={false}
          />
          {/* Format Button (Floating or Bottom) - Design shows it at bottom right of left panel */}
          <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
             <Button size="sm" onClick={handleFormat} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
               <FileJson className="mr-2 h-4 w-4" />
               格式化并处理
             </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-xs text-muted-foreground font-mono">JSON</span>
          {error && (
            <span className="text-xs text-red-500 flex items-center gap-1 truncate max-w-[200px]" title={error}>
              <AlertCircle className="h-3 w-3" />
              语法错误
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Visualization */}
      <div className="flex flex-1 flex-col rounded-xl border bg-background shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Maximize2 className="h-4 w-4" />
              <span>可视化预览</span>
            </div>
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                  viewMode === "tree" 
                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                树状图
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                  viewMode === "graph" 
                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                关系图
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                  viewMode === "table" 
                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                表格
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-7 text-xs text-muted-foreground"
               onClick={() => setExpandAll(!expandAll)}
             >
               {expandAll ? "全部折叠" : "全部展开"}
             </Button>
             <div className="h-4 w-[1px] bg-border" />
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCopyParsed} title="复制结果">
               <Copy className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleExport} title="导出">
               <Download className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 bg-white">
            {parsedJson ? (
             <ReactJson 
               src={parsedJson} 
               theme="rjv-default"
               style={{ backgroundColor: 'transparent', fontFamily: 'monospace', fontSize: '14px' }}
               displayDataTypes={true}
               displayObjectSize={true}
               enableClipboard={true}
               collapsed={expandAll ? false : 1}
               iconStyle="triangle"
               indentWidth={4}
             />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50">
              <Code2 className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">等待输入 JSON 数据...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 rounded-full", parsedJson ? "bg-green-500" : "bg-zinc-300")} />
              <span className={parsedJson ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {parsedJson ? "解析成功" : "等待解析"}
              </span>
            </div>
            <span className="text-muted-foreground">大小: {stats.size}</span>
            <span className="text-muted-foreground">耗时: {stats.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input 
                  className="h-7 w-[200px] pl-7 pr-12 text-xs bg-transparent border-zinc-200 dark:border-zinc-800" 
                  placeholder="搜索内容 (支持高亮)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {matches.length > 0 && (
                   <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                     {currentMatch + 1}/{matches.length}
                   </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={handleNextMatch}
                disabled={matches.length === 0}
              >
                下一个
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
