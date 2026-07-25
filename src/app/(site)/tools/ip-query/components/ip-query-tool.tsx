"use client";

import { useState, useEffect } from "react";
import { Globe, Search, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface IPInfo {
  ret: number;
  data: {
    ip: string;
    country: string;
    country_code: string;
    prov: string;
    city: string;
    city_code: string;
    city_short_code: string;
    area: string;
    post_code: string;
    area_code: string;
    isp: string;
    lng: string;
    lat: string;
    long_ip: number;
    big_area: string;
    ip_type: string;
    ip_asn: string;
  };
  qt: number;
}

interface InfoItem {
  label: string;
  value: string | number;
}

export function IPQueryTool() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // 页面加载时自动查询当前 IP
  useEffect(() => {
    handleQuery();
  }, []);

  const handleQuery = async (targetIp?: string) => {
    setLoading(true);
    try {
      const url = targetIp
        ? `/api/ip-query?ip=${encodeURIComponent(targetIp)}`
        : "/api/ip-query";
      const res = await fetch(url);
      const json: IPInfo = await res.json();
      if (json.ret === 200) {
        setIpInfo(json);
        if (!targetIp) {
          toast.success("当前 IP 查询成功");
        } else {
          toast.success("IP 查询成功");
        }
      } else {
        toast.error("查询失败，请稍后重试");
      }
    } catch {
      toast.error("请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && query.trim()) {
      handleQuery(query.trim());
    }
  };

  const handleCopy = async (value: string | number) => {
    const text = String(value);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedValue(text);
      toast("复制成功", { description: text });
      setTimeout(() => setCopiedValue(null), 1500);
    } catch {
      toast("复制失败", { description: "请手动选择并复制" });
    }
  };

  const infoItems: InfoItem[] = ipInfo
    ? [
        { label: "IP 地址", value: ipInfo.data.ip },
        { label: "国家/地区", value: ipInfo.data.country },
        { label: "国家简码", value: ipInfo.data.country_code.toUpperCase() },
        { label: "省份", value: ipInfo.data.prov },
        { label: "城市", value: ipInfo.data.city },
        { label: "城市简码", value: ipInfo.data.city_code },
        { label: "城市短码", value: ipInfo.data.city_short_code.toUpperCase() },
        { label: "区县", value: ipInfo.data.area },
        { label: "邮政编码", value: ipInfo.data.post_code },
        { label: "电话区号", value: ipInfo.data.area_code },
        { label: "运营商", value: ipInfo.data.isp },
        { label: "经度", value: ipInfo.data.lng },
        { label: "纬度", value: ipInfo.data.lat },
        { label: "Long IP", value: ipInfo.data.long_ip },
        { label: "大区", value: ipInfo.data.big_area },
        { label: "IP 类型", value: ipInfo.data.ip_type },
        { label: "AS 号", value: ipInfo.data.ip_asn },
      ]
    : [];

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-5xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 sm:mb-2">
          IP 地址查询
        </h1>
        <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
          查询当前 IP 或输入指定 IP，获取地理位置、运营商、ASN 等信息
        </p>
      </div>

      {/* 查询栏 */}
      <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入要查询的 IP 地址"
              className="pl-9 h-10 sm:h-11"
            />
          </div>
          <Button
            onClick={() => query.trim() && handleQuery(query.trim())}
            disabled={loading || !query.trim()}
            className="h-10 sm:h-11 px-5 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            查询
          </Button>
        </div>
      </Card>

      {/* 结果区域 */}
      {ipInfo && infoItems.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-2 sm:p-3 md:p-4 border-b bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">查询结果</h3>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              耗时 {ipInfo.qt}s
            </span>
          </div>
          <div className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleCopy(item.value)}
                  className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-muted/40 transition-colors select-none"
                >
                  <span className="text-xs sm:text-sm text-muted-foreground w-20 sm:w-28 shrink-0">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs sm:text-sm font-mono truncate min-w-0 ${
                        copiedValue === String(item.value)
                          ? "text-green-500"
                          : "text-foreground"
                      }`}
                    >
                      {copiedValue === String(item.value) ? "已复制" : item.value}
                    </span>
                    {copiedValue === String(item.value) ? (
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
