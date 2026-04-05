"use client";

import { ReactNode, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { resolveRedirect } from "@/app/(auth)/safe-redirect";

interface AuthModalProps {
  children: ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetPath = resolveRedirect(searchParams.get("from")) ?? "/";

  const handleClose = useCallback(
    (open: boolean) => {
      if (open) return;
      router.push(targetPath);
    },
    [router, targetPath],
  );

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl border-cyan-500/30 bg-[#020817] text-zinc-50" showCloseButton>
        {children}
      </DialogContent>
    </Dialog>
  );
}
