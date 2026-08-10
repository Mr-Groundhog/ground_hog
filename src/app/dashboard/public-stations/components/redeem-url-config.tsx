"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { setRedeemUrl } from "@/app/dashboard/credit-codes/actions";
import { DEFAULT_REDEEM_URL } from "@/app/dashboard/credit-codes/config";
import { useLoadingStore } from "@/store/loading-store";

export function RedeemUrlConfig({ currentUrl }: { currentUrl: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentUrl);
  const { startLoading, stopLoading } = useLoadingStore();

  const handleSave = async () => {
    startLoading();
    try {
      const res = await setRedeemUrl(value);
      toast.success("兑换入口链接已保存");
      setValue(res.redeemUrl);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "保存失败");
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
        onClick={() => {
          setValue(currentUrl);
          setOpen(true);
        }}
      >
        <Settings2 className="mr-2 h-4 w-4" /> 配置兑换入口
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">配置公益站额度兑换入口</DialogTitle>
            <DialogDescription className="text-zinc-400">
              该链接用于审核通过邮件中的「前往兑换」按钮，以及前台查询页复制额度码后的跳转。
              留空将使用默认地址 {DEFAULT_REDEEM_URL}。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-zinc-300">兑换入口链接</Label>
            <Input
              className="bg-zinc-900 border-zinc-700 text-zinc-50"
              placeholder={DEFAULT_REDEEM_URL}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
            onClick={handleSave}
          >
            保存
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
