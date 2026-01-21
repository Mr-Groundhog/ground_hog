"use client";

import { useState } from "react";
import { useLotteryStore } from "./lottery-store";
import { Upload, Settings, Trophy, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ControlPanel() {
  const { 
    participants, 
    addParticipants, 
    config, 
    setConfig, 
    winners, 
  } = useLotteryStore();

  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Split by new line, comma (eng/cn), or semicolon
      const names = text.split(/[\n,;，]+/).map(n => n.trim()).filter(n => n.length > 0);
      if (names.length > 0) {
        addParticipants(names);
        toast.success(`成功导入 ${names.length} 个名字`, {
          description: `示例: ${names.slice(0, 3).join(", ")}${names.length > 3 ? "..." : ""}`
        });
      } else {
        toast.error("未找到有效名字");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleManualAdd = () => {
    if (inputValue.trim()) {
      const names = inputValue.split(/[,，\n;]+/).map(n => n.trim()).filter(n => n.length > 0);
      if (names.length > 0) {
        addParticipants(names);
        toast.success(`已添加 ${names.length} 个名字`);
        setInputValue("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualAdd();
    }
  };

  const handleExport = () => {
    // Export as CSV
    const headers = "姓名,轮次,时间\n";
    const rows = winners.map(w => `${w.name},${w.round},${new Date(w.timestamp).toLocaleString()}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lottery_winners.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full w-80 bg-black/60 backdrop-blur-md border-r border-white/10 text-white transition-transform duration-300 z-10 flex flex-col",
      !isOpen && "-translate-x-full"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-8 top-1/2 bg-white/10 p-2 rounded-r-md backdrop-blur-md"
      >
        <Settings className="w-4 h-4" />
      </button>

      <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-teal-400">抽奖设置</h2>
          <p className="text-xs text-gray-400">参与人数: {participants.length}</p>
        </div>

        {/* Upload */}
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:bg-white/5 transition-colors relative">
          <input 
            type="file" 
            accept=".csv,.txt"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-400">上传名单 (CSV / TXT)</p>
          <p className="text-xs text-gray-600 mt-1">每行一个名字或用逗号分隔</p>
        </div>

        {/* Manual Input */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">手动输入 (回车添加，支持逗号分隔)</Label>
          <div className="flex gap-2">
            <Input 
              className="bg-white/5 border-white/10 text-white flex-1" 
              placeholder="张三, 李四..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleManualAdd} size="icon" className="shrink-0 bg-teal-500 hover:bg-teal-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">单次抽取人数</Label>
            <Input 
              type="number" 
              className="w-16 h-8 bg-white/5 border-white/10 text-white text-center"
              value={config.winnerCount}
              onChange={(e) => setConfig({ winnerCount: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">允许重复中奖</Label>
            <Switch 
              checked={config.allowRepeat}
              onCheckedChange={(c) => setConfig({ allowRepeat: c })}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">滚动速度</Label>
              <span className="text-xs text-gray-400">{config.speed}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={config.speed}
              onChange={(e) => setConfig({ speed: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>

        {/* Recent Winners */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            最新中奖名单
          </h3>
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-2">
              {winners.slice().reverse().map((winner) => (
                <div key={`${winner.id}-${winner.timestamp}`} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm">
                  <span className="font-medium">{winner.name}</span>
                  <span className="text-xs text-gray-400">第 {winner.round} 轮</span>
                </div>
              ))}
              {winners.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">暂无中奖记录</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-white/20 hover:bg-white/10 text-white bg-transparent"
          onClick={handleExport}
          disabled={winners.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          导出结果
        </Button>
      </div>
    </div>
  );
}
