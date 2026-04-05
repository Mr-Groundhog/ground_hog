"use client";

import { ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthModalProps {
  children: ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();

  const handleClose = useCallback(
    (open: boolean) => {
      if (open) return;
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    },
    [router],
  );

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl border-cyan-500/30 bg-[#020817] text-zinc-50" showCloseButton>
        {children}
      </DialogContent>
    </Dialog>
  );
}
