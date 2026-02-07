"use client";

import * as React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Upload, X, Settings2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function QRCodeGenerator() {
  const [value, setValue] = React.useState("https://example.com");
  const [size, setSize] = React.useState(256);
  const [logoEnabled, setLogoEnabled] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string>("");
  const [logoSize, setLogoSize] = React.useState(60);
  const qrRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("二维码已下载");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4 md:p-6 md:flex-row md:gap-6 md:h-[calc(100vh-8rem)]">
      {/* Settings Panel */}
      <Card className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto w-full md:w-auto">
        <div className="flex items-center gap-2 pb-4 border-b">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">二维码设置</h2>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label>内容</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="输入文本或链接..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>尺寸 ({size}px)</Label>
            </div>
            <Slider
              value={[size]}
              onValueChange={(v) => setSize(v[0])}
              min={128}
              max={512}
              step={8}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>中心 Logo</Label>
              <p className="text-xs text-muted-foreground">在二维码中心显示图标</p>
            </div>
            <Switch
              checked={logoEnabled}
              onCheckedChange={setLogoEnabled}
            />
          </div>

          {logoEnabled && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>上传图片</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {logoUrl ? (
                    <div className="relative h-16 w-16 rounded-md border overflow-hidden group">
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setLogoUrl("")}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Logo 尺寸 ({logoSize}px)</Label>
                </div>
                <Slider
                  value={[logoSize]}
                  onValueChange={(v) => setLogoSize(v[0])}
                  min={20}
                  max={120}
                  step={4}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Panel */}
      <Card className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed w-full md:w-auto">
        <div 
          ref={qrRef}
          className="p-4 md:p-8 bg-white rounded-xl shadow-sm border"
        >
          <QRCodeCanvas
            value={value}
            size={size}
            level={"H"}
            imageSettings={logoEnabled && logoUrl ? {
              src: logoUrl,
              height: logoSize,
              width: logoSize,
              excavate: true,
            } : undefined}
          />
        </div>
        
        <div className="mt-6 md:mt-8 flex flex-col w-full max-w-xs gap-4">
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            下载图片
          </Button>
        </div>
      </Card>
    </div>
  );
}