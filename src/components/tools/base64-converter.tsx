"use client";

import * as React from "react";
import { Base64 } from "js-base64";
import { Copy, Upload, ArrowRightLeft, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Base64Converter() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [mode, setMode] = React.useState<"encode" | "decode">("encode");

  // Auto convert when input changes
  React.useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(Base64.encode(input));
      } else {
        setOutput(Base64.decode(input));
      }
    } catch (e) {
      // Don't clear output immediately on error for better UX while typing
      // but maybe show a subtle indicator?
    }
  }, [input, mode]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // For image encoding, we put result in output directly if mode is encode
        // But the UI structure is Input -> Output. 
        // If uploading file, it's basically "File -> Base64". 
        // So we set Input as file info? No, we set Output directly.
        setMode("encode");
        // Base64 string includes "data:image/png;base64,..."
        // We might want to strip it or keep it depending on usage.
        // Usually keeping it is safer for "src".
        setInput(`[文件: ${file.name}]`);
        setOutput(result);
        toast.success("文件已转换为 Base64");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwap = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4 md:p-6 md:flex-row md:gap-6 md:h-[calc(100vh-8rem)]">
      <div className="flex flex-1 flex-col gap-4 md:gap-6 w-full">
        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")} className="w-full md:w-[400px]">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="encode" className="flex-1">Base64 编码</TabsTrigger>
              <TabsTrigger value="decode" className="flex-1">Base64 解码</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 mt-2 md:mt-0">
            <div className="relative w-full md:w-auto">
              <Input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
              />
              <Button variant="outline" className="w-full md:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">图片转 Base64</span>
                <span className="sm:hidden">图片转</span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setInput(""); setOutput(""); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6 w-full">
          {/* Input Area */}
          <Card className="flex-1 min-w-0 flex flex-col p-4 bg-background overflow-hidden w-full md:w-auto">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-muted-foreground text-sm">
                {mode === "encode" ? "输入内容 (Text / File)" : "Base64 编码"}
              </Label>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(input)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              className="flex-1 resize-none font-mono text-sm bg-muted/30 border-0 focus-visible:ring-1 h-32 md:h-auto"
              style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
              placeholder={mode === "encode" ? "输入要编码的文本..." : "输入要解码的 Base64 字符串..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Card>

          {/* Action Center */}
          <div className="flex flex-row md:flex-col justify-center items-center gap-4 md:gap-4 self-center md:self-auto py-4 md:py-0">
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10" onClick={handleSwap}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Output Area */}
          <Card className="flex-1 min-w-0 flex flex-col p-4 bg-background overflow-hidden w-full md:w-auto">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-muted-foreground text-sm">
                {mode === "encode" ? "Base64 结果" : "解码结果"}
              </Label>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(output)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              className="flex-1 resize-none font-mono text-sm bg-muted/30 border-0 focus-visible:ring-1 h-32 md:h-auto"
              style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
              placeholder="结果将显示在这里..."
              value={output}
              readOnly
            />
            {/* Image Preview if output looks like image data */}
            {output.startsWith("data:image") && (
              <div className="mt-4 h-32 border rounded-md overflow-hidden bg-checkered flex items-center justify-center md:h-40 lg:h-48">
                <img src={output} alt="Preview" className="h-full w-full object-contain" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}