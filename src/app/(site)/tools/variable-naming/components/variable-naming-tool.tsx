"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Copy, Check, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface NamingItem {
  key: string;
  value: string;
}

interface NamingGroup {
  name: string;
  items: NamingItem[];
}

export function VariableNamingTool() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NamingGroup[]>([]);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/rcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        if (json.code === 0 && json.data?.length > 0) {
          setResults(json.data);
        } else {
          setResults([]);
          if (json.code === 0 && (!json.data || json.data.length === 0)) {
            toast.info("未找到翻译结果，请尝试其他输入");
          }
        }
      } catch {
        toast.error("请求失败，请检查网络");
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && query.trim()) {
      handleSearch();
    }
  };

  const handleCopy = async (value: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("input");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedValue(value);
      toast("复制成功", {
        description: value,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      setTimeout(() => setCopiedValue(null), 1500);
    } catch {
      toast("复制失败", {
        description: "请手动选择并复制",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-6xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 sm:mb-2">
          变量命名工具
        </h1>
        <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
          输入中文或英文描述，一键生成 46 种程序员常用变量命名格式
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 15))}
            onKeyDown={handleKeyDown}
            placeholder="请输入中文名（最多 15 字）"
            maxLength={15}
            className="pl-9 h-10 sm:h-11"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-10 sm:h-11 px-5"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Search className="h-4 w-4 mr-1" />
          )}
          搜索
        </Button>
      </div>

      {/* 结果区域 */}
      {results.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {results.map((group) => (
            <NamingSection
              key={group.name}
              group={group}
              onCopy={handleCopy}
              copiedValue={copiedValue}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <Card className="p-8 sm:p-12 text-center">
            <Code2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-medium mb-2">等待输入</h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              输入中文描述（如"用户登录"）或英文单词，系统将自动生成多种变量命名格式
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function NamingSection({
  group,
  onCopy,
  copiedValue,
}: {
  group: NamingGroup;
  onCopy: (value: string) => void;
  copiedValue: string | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pl-1">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <span className="text-sm sm:text-base font-bold">{group.name}</span>
        <span className="text-xs text-muted-foreground">
          ({group.items.length})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
        {group.items.map((item) => (
          <NamingCard
            key={item.key}
            label={item.key}
            value={item.value}
            isCopied={copiedValue === item.value}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}

function NamingCard({
  label,
  value,
  isCopied,
  onCopy,
}: {
  label: string;
  value: string;
  isCopied: boolean;
  onCopy: (value: string) => void;
}) {
  return (
    <Card
      onClick={() => onCopy(value)}
      className="cursor-pointer p-3 hover:border-blue-500/50 hover:shadow-sm transition-all duration-200 select-none group"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs text-muted-foreground truncate">{label}</span>
        {isCopied ? (
          <Check className="h-3 w-3 text-green-500 shrink-0" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </div>
      <div className="font-mono text-sm text-foreground truncate" title={value}>
        {isCopied ? (
          <span className="text-green-500">已复制</span>
        ) : (
          value
        )}
      </div>
    </Card>
  );
}
