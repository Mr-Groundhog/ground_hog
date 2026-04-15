"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AuthModalProps {
  children: ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">登录</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
