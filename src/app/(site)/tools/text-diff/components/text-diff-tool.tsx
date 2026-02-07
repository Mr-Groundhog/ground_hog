"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { diffLines, Change } from "diff";
import { useToast } from "./use-toast";
import { 
  Copy, 
  RotateCcw, 
  ArrowLeftRight, 
  Play, 
  Eraser,
  FileText,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// 差异类型枚举
type DiffType = 'added' | 'removed' | 'unchanged';

// 差异行接口
interface DiffLine {
  type: DiffType;
  content: string;
  lineNumber: number;
}

export function TextDiffTool() {
  // 状态管理
  const [leftText, setLeftText] = useState<string>("");
  const [rightText, setRightText] = useState<string>("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [isCompared, setIsCompared] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [hideEmptyLines, setHideEmptyLines] = useState<boolean>(false);
  const [isRealTime, setIsRealTime] = useState<boolean>(false);
  
  const { showToast } = useToast();
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 执行文本比较
  const performDiff = useCallback(() => {
    if (!leftText.trim() && !rightText.trim()) {
      showToast("请输入要比较的文本", "warning");
      return;
    }

    const diff = diffLines(leftText, rightText);
    const result: DiffLine[] = [];
    let leftLineNumber = 1;
    let rightLineNumber = 1;

    diff.forEach((part: Change) => {
      const lines = part.value.split('\n');
      
      lines.forEach((line: string, index: number) => {
        // 跳过最后一个空行（split会产生）
        if (index === lines.length - 1 && line === '' && part.value.endsWith('\n')) {
          return;
        }

        // 如果启用了隐藏空行且当前行为空，则跳过
        if (hideEmptyLines && line.trim() === '') {
          if (!part.added) leftLineNumber++;
          if (!part.removed) rightLineNumber++;
          return;
        }

        const diffLine: DiffLine = {
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          content: line,
          lineNumber: part.added ? rightLineNumber : leftLineNumber
        };

        result.push(diffLine);

        // 更新行号
        if (!part.added) leftLineNumber++;
        if (!part.removed) rightLineNumber++;
      });
    });

    setDiffResult(result);
    setIsCompared(true);
    
    if (leftText === rightText) {
      showToast("两个文本完全相同", "info");
    } else {
      const changes = result.filter(line => line.type !== 'unchanged').length;
      showToast(`发现 ${changes} 处差异`, "success");
    }
  }, [leftText, rightText, hideEmptyLines, showToast]);

  // 实时比较（防抖）
  const debouncedDiff = useCallback(
    debounce(() => {
      if (isRealTime && (leftText.trim() || rightText.trim())) {
        performDiff();
      }
    }, 500),
    [isRealTime, leftText, rightText, performDiff]
  );

  // 监听文本变化进行实时比较
  useEffect(() => {
    if (isRealTime) {
      debouncedDiff();
    }
  }, [leftText, rightText, isRealTime, debouncedDiff]);

  // 清空指定文本区域
  const clearText = (side: 'left' | 'right' | 'both') => {
    if (side === 'left' || side === 'both') {
      setLeftText("");
    }
    if (side === 'right' || side === 'both') {
      setRightText("");
    }
    if (side === 'both') {
      setDiffResult([]);
      setIsCompared(false);
      showToast("已清空所有文本", "success");
    } else {
      showToast(`已清空${side === 'left' ? '左侧' : '右侧'}文本`, "success");
    }
  };

  // 交换左右文本
  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    showToast("已交换左右文本", "success");
  };

  // 复制对比结果
  const copyDiffResult = () => {
    if (!isCompared) {
      showToast("请先进行文本比较", "warning");
      return;
    }

    let result = "=== 文本差异对比结果 ===\n\n";
    
    diffResult.forEach(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      result += `${prefix} ${line.content}\n`;
    });

    navigator.clipboard.writeText(result).then(() => {
      showToast("对比结果已复制到剪贴板", "success");
    }).catch(() => {
      showToast("复制失败", "error");
    });
  };

  // 获取行的CSS类名
  const getLineClass = (type: DiffType) => {
    switch (type) {
      case 'added':
        return "bg-green-500/20 border-l-4 border-green-500";
      case 'removed':
        return "bg-red-500/20 border-l-4 border-red-500";
      case 'unchanged':
        return "bg-muted/30";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-7xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 sm:mb-2">程序员专用文本比对工具</h1>
        <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
          支持代码、文本的智能差异对比，高亮显示变更内容
        </p>
      </div>

      {/* 控制面板 */}
      <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center justify-between">
          {/* 左侧控制按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={performDiff} 
              disabled={isRealTime}
              className="flex items-center gap-2 h-9 sm:h-10"
              size="sm"
            >
              <Play className="h-4 w-4" />
              <span className="hidden xs:inline">一键对比</span>
              <span className="xs:hidden">对比</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => clearText('both')}
              className="flex items-center gap-2 h-9 sm:h-10"
              size="sm"
            >
              <Eraser className="h-4 w-4" />
              <span className="hidden xs:inline">清空全部</span>
              <span className="xs:hidden">清空</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={swapTexts}
              className="flex items-center gap-2 h-9 sm:h-10"
              size="sm"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden xs:inline">交换文本</span>
              <span className="xs:hidden">交换</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={copyDiffResult}
              disabled={!isCompared}
              className="flex items-center gap-2 h-9 sm:h-10"
              size="sm"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden xs:inline">复制结果</span>
              <span className="xs:hidden">复制</span>
            </Button>
          </div>

          {/* 右侧设置选项 */}
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            <div className="flex items-center gap-2">
              <Switch
                id="real-time"
                checked={isRealTime}
                onCheckedChange={setIsRealTime}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600"
              />
              <Label htmlFor="real-time" className="text-xs sm:text-sm whitespace-nowrap">实时对比</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="line-numbers"
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
              />
              <Label htmlFor="line-numbers" className="text-xs sm:text-sm whitespace-nowrap">显示行号</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="hide-empty"
                checked={hideEmptyLines}
                onCheckedChange={setHideEmptyLines}
                className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-600"
              />
              <Label htmlFor="hide-empty" className="text-xs sm:text-sm whitespace-nowrap">隐藏空行</Label>
            </div>
          </div>
        </div>
      </Card>

      {/* 文本输入区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* 左侧原始文本 */}
        <Card className="overflow-hidden">
          <div className="p-2 sm:p-3 md:p-4 border-b bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">原始文本</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => clearText('left')}
              className="h-8 w-8 p-0"
            >
              <Eraser className="h-3 w-3" />
            </Button>
          </div>
          <Textarea
            ref={leftTextareaRef}
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="请输入原始文本内容..."
            className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px] font-mono text-xs sm:text-sm resize-none border-0 rounded-none focus-visible:ring-0"
          />
        </Card>

        {/* 右侧修改后文本 */}
        <Card className="overflow-hidden">
          <div className="p-2 sm:p-3 md:p-4 border-b bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm sm:text-base">修改后文本</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => clearText('right')}
              className="h-8 w-8 p-0"
            >
              <Eraser className="h-3 w-3" />
            </Button>
          </div>
          <Textarea
            ref={rightTextareaRef}
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="请输入修改后的文本内容..."
            className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px] font-mono text-xs sm:text-sm resize-none border-0 rounded-none focus-visible:ring-0"
          />
        </Card>
      </div>

      {/* 差异结果显示 */}
      {isCompared && diffResult.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-2 sm:p-3 md:p-4 border-b bg-muted/50">
            <h3 className="font-semibold text-sm sm:text-base">差异对比结果</h3>
          </div>
          <div className="p-3 sm:p-4">
            <div className="font-mono text-xs sm:text-sm space-y-0.5 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {diffResult.map((line, index) => (
                <div 
                  key={index}
                  className={`flex hover:bg-muted/50 transition-colors ${getLineClass(line.type)}`}
                >
                  {showLineNumbers && (
                    <div className="w-8 sm:w-10 md:w-12 text-right text-muted-foreground pr-1 sm:pr-2 select-none shrink-0 text-xs">
                      {line.lineNumber}
                    </div>
                  )}
                  <div className="flex-1 pl-1 sm:pl-2 py-0.5">
                    <span className={line.type === 'added' ? 'text-green-600' : 
                                   line.type === 'removed' ? 'text-red-600' : 
                                   'text-foreground'}>
                      {line.content || '(空行)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 空状态提示 */}
      {!isCompared && (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium mb-2">等待文本对比</h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            请在上方输入要比较的文本内容，然后点击"一键对比"按钮
          </p>
        </Card>
      )}
    </div>
  );
}

// 防抖函数
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}