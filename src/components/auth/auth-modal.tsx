"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AuthModalProps {
  children: ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">登录</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
